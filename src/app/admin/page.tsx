import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Pagina protegida de teste. O middleware ja bloqueia quem nao esta logado;
// aqui lemos a sessao so para mostrar quem entrou. (Dashboard real = Etapa 3.)
export default async function PainelAdmin() {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F7F6",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "60px auto",
          background: "#fff",
          border: "1px solid #E6E6E4",
          borderRadius: 16,
          padding: 32,
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
            marginBottom: 20,
          }}
        >
          in
        </div>

        <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>
          Voce esta logado ✅
        </h1>
        <p style={{ color: "#6B6B6B", margin: "0 0 24px" }}>
          Autenticacao funcionando. O dashboard com dados reais vem na proxima etapa.
        </p>

        <dl style={{ margin: 0, fontSize: 14, lineHeight: 2 }}>
          <div>
            <strong>Nome:</strong> {sessao.nome}
          </div>
          <div>
            <strong>E-mail:</strong> {sessao.email}
          </div>
          <div>
            <strong>Papel:</strong>{" "}
            <span
              style={{
                background: "#FF001E14",
                color: "#FF001E",
                fontWeight: 700,
                borderRadius: 8,
                padding: "2px 10px",
                fontSize: 13,
              }}
            >
              {sessao.papel}
            </span>
          </div>
          <div>
            <strong>Organizacao:</strong> {sessao.organizacaoId ?? "—"}
          </div>
        </dl>

        <form action="/api/auth/logout" method="post" style={{ marginTop: 28 }}>
          <button
            type="submit"
            style={{
              background: "#fff",
              color: "#121111",
              border: "1px solid #E6E6E4",
              borderRadius: 12,
              padding: "11px 18px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
