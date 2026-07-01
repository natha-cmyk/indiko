import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { BadgeStatus } from "@/components/badge-status";

export const dynamic = "force-dynamic";

export default async function DetalheParceiro({ params }: { params: { id: string } }) {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");
  const orgId = sessao.organizacaoId ?? "";

  // So encontra se o parceiro for da mesma organizacao (isolamento entre empresas).
  const parceiro = await prisma.parceiro.findFirst({
    where: { id: params.id, organizacaoId: orgId },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      status: true,
      dataCadastro: true,
      programa: { select: { nome: true } },
      nivel: { select: { nome: true } },
      _count: { select: { indicacoes: true, comissoes: true } },
    },
  });

  if (!parceiro) {
    return (
      <AdminShell titulo="Parceiro" atual="Parceiros" nome={sessao.nome} papel={sessao.papel}>
        <a href="/admin/parceiros" style={{ fontSize: 13, color: "#00BBC5", textDecoration: "none" }}>
          ← Voltar para a lista
        </a>
        <p style={{ color: "#6B6B6B", marginTop: 20 }}>Parceiro não encontrado.</p>
      </AdminShell>
    );
  }

  const dados = [
    { rotulo: "E-mail", valor: parceiro.email },
    { rotulo: "Telefone", valor: parceiro.telefone ?? "—" },
    { rotulo: "Programa", valor: parceiro.programa?.nome ?? "—" },
    { rotulo: "Nível", valor: parceiro.nivel?.nome ?? "—" },
    {
      rotulo: "Cadastrado em",
      valor: parceiro.dataCadastro.toLocaleDateString("pt-BR"),
    },
  ];

  const podePausar = parceiro.status !== "BANIDO";
  const acaoRotulo = parceiro.status === "ATIVO" ? "Pausar parceiro" : "Reativar parceiro";

  return (
    <AdminShell titulo="Parceiro" atual="Parceiros" nome={sessao.nome} papel={sessao.papel}>
      <a href="/admin/parceiros" style={{ fontSize: 13, color: "#00BBC5", textDecoration: "none" }}>
        ← Voltar para a lista
      </a>

      <div
        style={{
          background: "#fff",
          border: "1px solid #E6E6E4",
          borderRadius: 16,
          padding: 24,
          marginTop: 12,
          maxWidth: 640,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{parceiro.nome}</h2>
          </div>
          <BadgeStatus status={parceiro.status} />
        </div>

        <dl style={{ margin: "20px 0 0", fontSize: 14, lineHeight: 2 }}>
          {dados.map((d) => (
            <div key={d.rotulo}>
              <strong style={{ color: "#6B6B6B", fontWeight: 600 }}>{d.rotulo}:</strong>{" "}
              {d.valor}
            </div>
          ))}
        </dl>

        {/* Contagens do parceiro (0 por enquanto) */}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <div style={caixaContagem}>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>Indicações</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{parceiro._count.indicacoes}</div>
          </div>
          <div style={caixaContagem}>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>Comissões</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{parceiro._count.comissoes}</div>
          </div>
        </div>

        {/* Acao: pausar / reativar */}
        {podePausar && (
          <form action={`/api/parceiros/${parceiro.id}/status`} method="post" style={{ marginTop: 24 }}>
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
              {acaoRotulo}
            </button>
          </form>
        )}
      </div>
    </AdminShell>
  );
}

const caixaContagem: React.CSSProperties = {
  flex: 1,
  background: "#F7F7F6",
  borderRadius: 12,
  padding: "12px 16px",
};
