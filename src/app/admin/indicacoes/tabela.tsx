"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeIndicacao, STATUS_INDICACAO } from "@/components/badge-indicacao";

type Item = {
  id: string;
  leadNome: string;
  contato: string;
  parceiroNome: string;
  produtoNome: string;
  dataLabel: string;
  status: string;
};

export function IndicacoesTabela({ indicacoes }: { indicacoes: Item[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [alvo, setAlvo] = useState("AGUARDANDO_CONTATO");
  const [ocupado, setOcupado] = useState(false);

  function alterna(id: string) {
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function todas() {
    setSel((s) => (s.size === indicacoes.length ? new Set() : new Set(indicacoes.map((i) => i.id))));
  }

  async function aplicar() {
    if (sel.size === 0) return;
    setOcupado(true);
    try {
      await fetch("/api/indicacoes/status-lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...sel], status: alvo }),
      });
      setSel(new Set());
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div>
      {sel.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#121111", color: "#fff", borderRadius: 12, padding: "10px 16px", marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{sel.size} selecionada(s)</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13 }}>Mudar status para</span>
          <select value={alvo} onChange={(e) => setAlvo(e.target.value)} style={{ borderRadius: 8, padding: "7px 10px", border: "none", fontSize: 13, fontFamily: "inherit" }}>
            {Object.entries(STATUS_INDICACAO).map(([v, r]) => (
              <option key={v} value={v}>{r}</option>
            ))}
          </select>
          <button onClick={aplicar} disabled={ocupado} style={{ background: "#FF001E", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Aplicar
          </button>
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#9A9A98", fontSize: 12 }}>
              <th style={{ ...th, width: 36 }}>
                <input type="checkbox" checked={sel.size === indicacoes.length && indicacoes.length > 0} onChange={todas} />
              </th>
              <th style={th}>Indicado</th>
              <th style={th}>Parceiro</th>
              <th style={th}>Produto</th>
              <th style={th}>Data</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {indicacoes.map((i) => (
              <tr key={i.id} style={{ borderTop: "1px solid #F0F0EF", background: sel.has(i.id) ? "#FFF7F8" : undefined }}>
                <td style={td}>
                  <input type="checkbox" checked={sel.has(i.id)} onChange={() => alterna(i.id)} />
                </td>
                <td style={td}>
                  <a href={`/admin/indicacoes/${i.id}`} style={{ color: "#121111", textDecoration: "none", fontWeight: 600 }}>
                    {i.leadNome}
                  </a>
                  <div style={{ fontSize: 12, color: "#9A9A98" }}>{i.contato}</div>
                </td>
                <td style={td}>{i.parceiroNome}</td>
                <td style={td}>{i.produtoNome}</td>
                <td style={td}>{i.dataLabel}</td>
                <td style={td}><BadgeIndicacao status={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: "#9A9A98", margin: "10px 0 0" }}>
        Marque uma ou várias para mudar o status em lote — ou clique no nome para abrir e mudar individualmente.
      </p>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: "14px 16px" };
