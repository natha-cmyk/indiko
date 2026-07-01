"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Programa = { id: string; nome: string };
type Nivel = { id: string; nome: string; programaId: string };

export function FormularioNovoParceiro({
  programas,
  niveis,
}: {
  programas: Programa[];
  niveis: Nivel[];
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [programaId, setProgramaId] = useState("");
  const [nivelId, setNivelId] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Niveis do programa escolhido (para o segundo select).
  const niveisDoPrograma = niveis.filter((n) => n.programaId === programaId);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const resp = await fetch("/api/parceiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, programaId, nivelId }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro || "Não foi possível cadastrar.");
        return;
      }
      router.push("/admin/parceiros");
      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <a href="/admin/parceiros" style={{ fontSize: 13, color: "#00BBC5", textDecoration: "none" }}>
        ← Voltar para a lista
      </a>

      <form
        onSubmit={salvar}
        style={{
          background: "#fff",
          border: "1px solid #E6E6E4",
          borderRadius: 16,
          padding: 24,
          marginTop: 12,
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>Convite individual</h2>
        <p style={{ fontSize: 13, color: "#6B6B6B", margin: "0 0 20px" }}>
          Cadastra o parceiro no sistema. O envio do convite por e-mail será ligado na etapa de
          integração de e-mail.
        </p>

        <label style={rotulo}>Nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required style={campo} />

        <label style={{ ...rotulo, marginTop: 16 }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={campo}
        />

        <label style={{ ...rotulo, marginTop: 16 }}>Telefone / WhatsApp (opcional)</label>
        <input value={telefone} onChange={(e) => setTelefone(e.target.value)} style={campo} />

        <label style={{ ...rotulo, marginTop: 16 }}>Programa</label>
        <select
          value={programaId}
          onChange={(e) => {
            setProgramaId(e.target.value);
            setNivelId(""); // limpa o nivel ao trocar de programa
          }}
          required
          style={campo}
        >
          <option value="">Selecione um programa…</option>
          {programas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <label style={{ ...rotulo, marginTop: 16 }}>Nível inicial (opcional)</label>
        <select
          value={nivelId}
          onChange={(e) => setNivelId(e.target.value)}
          disabled={!programaId}
          style={{ ...campo, background: programaId ? "#fff" : "#F2F2F1" }}
        >
          <option value="">Sem nível definido</option>
          {niveisDoPrograma.map((n) => (
            <option key={n.id} value={n.id}>
              {n.nome}
            </option>
          ))}
        </select>

        {erro && (
          <p style={{ color: "#FF001E", fontSize: 13, margin: "16px 0 0", fontWeight: 600 }}>
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando}
          style={{
            width: "100%",
            marginTop: 24,
            background: salvando ? "#9A9A98" : "#FF001E",
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            border: "none",
            borderRadius: 12,
            padding: "13px 20px",
            cursor: salvando ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {salvando ? "Salvando..." : "Cadastrar parceiro"}
        </button>
      </form>
    </div>
  );
}

const rotulo: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
};

const campo: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #E6E6E4",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  fontFamily: "inherit",
};
