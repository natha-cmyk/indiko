import type { ReactNode } from "react";

// Estrutura visual do painel admin: menu lateral + cabecalho.
// Reutilizavel pelas proximas telas (basta passar o titulo e o conteudo).

const FONT = "'Montserrat', system-ui, sans-serif";
const VERMELHO = "#FF001E";
const BORDA = "#E6E6E4";

// Itens do menu. Os que ainda nao existem ficam marcados como "em breve".
const MENU: { rotulo: string; href?: string }[] = [
  { rotulo: "Visão geral", href: "/admin" },
  { rotulo: "Indicações" },
  { rotulo: "Resgates" },
  { rotulo: "Programas" },
  { rotulo: "Parceiros", href: "/admin/parceiros" },
  { rotulo: "Webhooks" },
];

export function AdminShell({
  titulo,
  atual,
  nome,
  papel,
  children,
}: {
  titulo: string;
  atual: string; // rotulo do item de menu ativo
  nome: string;
  papel: string;
  children: ReactNode;
}) {
  const inicial = (nome?.trim()?.[0] || "?").toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT, color: "#121111" }}>
      {/* MENU LATERAL */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: `1px solid ${BORDA}`,
          background: "#fff",
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 20px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: VERMELHO,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            in
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 800 }}>Indiko</div>
            <div style={{ fontSize: 10, color: "#9A9A98", letterSpacing: 0.5 }}>ADMIN · SEAHUB</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {MENU.map((item) => {
            const ativo = item.rotulo === atual;
            const base: React.CSSProperties = {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: ativo ? 600 : 500,
            };
            if (item.href) {
              return (
                <a
                  key={item.rotulo}
                  href={item.href}
                  style={{
                    ...base,
                    textDecoration: "none",
                    color: ativo ? VERMELHO : "#6B6B6B",
                    background: ativo ? "#FF001E14" : "transparent",
                  }}
                >
                  {item.rotulo}
                </a>
              );
            }
            return (
              <span key={item.rotulo} style={{ ...base, color: "#C4C4C2", cursor: "default" }}>
                {item.rotulo}
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9A9A98" }}>em breve</span>
              </span>
            );
          })}
        </nav>

        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            style={{
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              color: "#6B6B6B",
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sair
          </button>
        </form>
      </aside>

      {/* AREA PRINCIPAL */}
      <div style={{ flex: 1, minWidth: 0, background: "#F7F7F6" }}>
        <header
          style={{
            height: 64,
            borderBottom: `1px solid ${BORDA}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{titulo}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#6B6B6B" }}>
              {nome} · {papel}
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: VERMELHO,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {inicial}
            </div>
          </div>
        </header>

        <main style={{ padding: 24, maxWidth: 1120 }}>{children}</main>
      </div>
    </div>
  );
}
