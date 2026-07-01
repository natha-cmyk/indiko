"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginAdmin() {
  return (
    <Suspense fallback={null}>
      <Formulario />
    </Suspense>
  );
}

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const proximo = params.get("proximo") || "/admin";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro || "Não foi possível entrar.");
        return;
      }
      router.push(proximo);
      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F7F6",
        padding: 24,
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo + titulo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#FF001E",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            in
          </div>
          <div style={{ textAlign: "center", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              Indiko <span style={{ color: "#FF001E" }}>Admin</span>
            </div>
            <div style={{ fontSize: 12, color: "#9A9A98" }}>
              Painel de gestão · Seahub
            </div>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={entrar}
          style={{
            background: "#fff",
            border: "1px solid #E6E6E4",
            borderRadius: 16,
            boxShadow: "0 1px 2px rgba(18,17,17,.06)",
            padding: 28,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
            Acesso restrito
          </h2>
          <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 20px" }}>
            Entre com suas credenciais de administrador.
          </p>

          <label style={rotulo}>E-mail corporativo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={campo}
          />

          <label style={{ ...rotulo, marginTop: 16 }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
            style={campo}
          />

          {erro && (
            <p
              style={{
                color: "#FF001E",
                fontSize: 13,
                margin: "14px 0 0",
                fontWeight: 600,
              }}
            >
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando} style={botao(carregando)}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
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

function botao(carregando: boolean): React.CSSProperties {
  return {
    width: "100%",
    marginTop: 24,
    background: carregando ? "#9A9A98" : "#FF001E",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    border: "none",
    borderRadius: 12,
    padding: "13px 20px",
    cursor: carregando ? "default" : "pointer",
  };
}
