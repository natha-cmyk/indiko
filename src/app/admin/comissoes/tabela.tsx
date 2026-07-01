"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeComissao } from "@/components/badge-comissao";

type Item = {
  id: string;
  valorLabel: string;
  status: string;
  geradaEmLabel: string;
  parceiroNome: string;
  leadNome: string;
  produtoNome: string;
};

export function ComissoesTabela({ comissoes }: { comissoes: Item[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [ocupado, setOcupado] = useState(false);

  function alterna(id: string) {
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function todas() {
    setSel((s) => (s.size === comissoes.length ? new Set() : new Set(comissoes.map((c) => c.id))));
  }

  async function acao(url: string) {
    if (sel.size === 0) return;
    setOcupado(true);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...sel] }),
      });
      setSel(new Set());
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div>
      {/* Barra de acoes em lote (aparece quando ha selecao) */}
      {sel.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#121111", color: "#fff", borderRadius: 12, padding: "10px 16px", marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{sel.size} selecionada(s)</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => acao("/api/comissoes/liberar-selecionadas")} disabled={ocupado} style={botao("#00BBC5")}>
            Liberar selecionadas
          </button>
          <button onClick={() => acao("/api/comissoes/pagar-selecionadas")} disabled={ocupado} style={botao("#16A34A")}>
            Marcar como pagas
          </button>
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#9A9A98", fontSize: 12 }}>
              <th style={{ ...th, width: 36 }}>
                <input type="checkbox" checked={sel.size === comissoes.length && comissoes.length > 0} onChange={todas} />
              </th>
              <th style={th}>Parceiro</th>
              <th style={th}>Indicado / Produto</th>
              <th style={th}>Valor</th>
              <th style={th}>Gerada em</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {comissoes.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #F0F0EF", background: sel.has(c.id) ? "#FFF7F8" : undefined }}>
                <td style={td}>
                  <input type="checkbox" checked={sel.has(c.id)} onChange={() => alterna(c.id)} />
                </td>
                <td style={td}>{c.parceiroNome}</td>
                <td style={td}>
                  {c.leadNome}
                  <div style={{ fontSize: 12, color: "#9A9A98" }}>{c.produtoNome}</div>
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{c.valorLabel}</td>
                <td style={td}>{c.geradaEmLabel}</td>
                <td style={td}><BadgeComissao status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: "#9A9A98", margin: "10px 0 0" }}>
        Marque uma ou várias e use os botões. “Liberar selecionadas” pode adiantar a liberação (não espera os 15 dias);
        “Marcar como pagas” só afeta as que estão Disponível.
      </p>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: "14px 16px" };
function botao(cor: string): React.CSSProperties {
  return { background: cor, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
}
