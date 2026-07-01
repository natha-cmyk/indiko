"use client";

import { useState } from "react";

type Produto = { id: string; nome: string };

export function LandingForm({
  parceiroId,
  parceiroNome,
  orgNome,
  cor,
  whatsapp,
  produtos,
}: {
  parceiroId: string;
  parceiroNome: string;
  orgNome: string;
  cor: string;
  whatsapp: string;
  produtos: Produto[];
}) {
  const [leadNome, setLeadNome] = useState("");
  const [leadTelefone, setLeadTelefone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  const iniciais = parceiroNome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resp = await fetch("/api/indicacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parceiroId, produtoId, leadNome, leadTelefone, leadEmail }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro || "Não foi possível enviar.");
        return;
      }
      // Monta a mensagem pronta e redireciona para o WhatsApp do Seahub.
      const prod = produtos.find((p) => p.id === produtoId);
      const msg =
        `Oi! Vim pela indicação de ${parceiroNome}` +
        (prod ? ` e quero saber sobre ${prod.nome}` : "") +
        `. Meu nome é ${leadNome}.`;
      const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
      setWaUrl(url);
      setEnviado(true);
      window.location.href = url;
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ fontFamily: "'Montserrat', system-ui, sans-serif", color: "#121111" }}>
      {/* Cabecalho */}
      <header style={{ borderBottom: "1px solid #E6E6E4" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: cor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
            {orgNome[0]?.toUpperCase() ?? "S"}
          </div>
          <span style={{ fontWeight: 800 }}>{orgNome}</span>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr", maxWidth: 520, marginInline: "auto" }}>
          {/* Selo do parceiro */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#F2F2F1", borderRadius: 999, padding: "6px 16px 6px 6px", width: "fit-content" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00BBC5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {iniciais}
            </div>
            <span style={{ fontSize: 14 }}>
              <strong>{parceiroNome}</strong> indicou você 💙
            </span>
          </div>

          {enviado ? (
            <div style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, padding: 32, textAlign: "center", boxShadow: "0 12px 40px rgba(18,17,17,.10)" }}>
              <div style={{ fontSize: 40 }}>💬</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "12px 0 6px" }}>Tudo certo!</h2>
              <p style={{ color: "#6B6B6B", margin: "0 0 16px" }}>
                Estamos te levando ao WhatsApp do {orgNome}. Se não abrir automaticamente, é só tocar no botão abaixo.
              </p>
              {waUrl && (
                <a
                  href={waUrl}
                  style={{ display: "inline-block", background: cor, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, borderRadius: 12, padding: "13px 22px" }}
                >
                  Abrir WhatsApp
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={enviar} style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, padding: 28, boxShadow: "0 12px 40px rgba(18,17,17,.10)" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>É um prazer te receber no {orgNome}</h2>
              <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 20px" }}>
                Preencha as informações abaixo e aperte no botão pra agilizarmos seu atendimento.
              </p>

              <label style={rotulo}>Seu nome</label>
              <input value={leadNome} onChange={(e) => setLeadNome(e.target.value)} required style={campo} placeholder="Como podemos te chamar?" />

              <label style={{ ...rotulo, marginTop: 16 }}>WhatsApp</label>
              <input value={leadTelefone} onChange={(e) => setLeadTelefone(e.target.value)} style={campo} placeholder="(84) 9 9999-9999" />

              <label style={{ ...rotulo, marginTop: 16 }}>E-mail</label>
              <input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required style={campo} placeholder="voce@email.com" />

              <label style={{ ...rotulo, marginTop: 16 }}>O que você procura?</label>
              <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required style={campo}>
                {produtos.length === 0 && <option value="">—</option>}
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>

              {erro && <p style={{ color: "#FF001E", fontSize: 13, margin: "16px 0 0", fontWeight: 600 }}>{erro}</p>}

              <button type="submit" disabled={enviando} style={{ width: "100%", marginTop: 24, background: enviando ? "#9A9A98" : cor, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 12, padding: "14px 20px", cursor: enviando ? "default" : "pointer", fontFamily: "inherit" }}>
                {enviando ? "Enviando..." : "Enviar pro Seahub"}
              </button>
              <p style={{ fontSize: 12, textAlign: "center", color: "#9A9A98", margin: "12px 0 0" }}>
                Você será redirecionado(a) para o nosso WhatsApp. Te vejo lá!
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

const rotulo: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };
const campo: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #E6E6E4",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  fontFamily: "inherit",
};
