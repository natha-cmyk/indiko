import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { BadgeStatus } from "@/components/badge-status";
import { BadgeComissao } from "@/components/badge-comissao";
import { CopyLink } from "@/components/copy-link";
import { formatBRL } from "@/lib/comissao";

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

  // Carteira do parceiro: somatorios por status + comissoes recentes.
  const [carteira, comissoes] = await Promise.all([
    prisma.comissao.groupBy({
      by: ["status"],
      where: { organizacaoId: orgId, parceiroId: parceiro.id },
      _sum: { valorLiquidoCents: true },
    }),
    prisma.comissao.findMany({
      where: { organizacaoId: orgId, parceiroId: parceiro.id },
      orderBy: { geradaEm: "desc" },
      take: 20,
      select: {
        id: true,
        valorLiquidoCents: true,
        status: true,
        geradaEm: true,
        indicacao: { select: { leadNome: true, produto: { select: { nome: true } } } },
      },
    }),
  ]);
  const somaCarteira = (s: string) =>
    carteira.find((g) => g.status === s)?._sum.valorLiquidoCents ?? 0;
  const carteiraTotais = [
    { rotulo: "A liberar", valor: somaCarteira("PENDENTE"), cor: "#F59E0B" },
    { rotulo: "Disponível", valor: somaCarteira("DISPONIVEL"), cor: "#00BBC5" },
    { rotulo: "Paga", valor: somaCarteira("PAGA"), cor: "#16A34A" },
  ];

  const podePausar = parceiro.status !== "BANIDO";
  const acaoRotulo = parceiro.status === "ATIVO" ? "Pausar parceiro" : "Reativar parceiro";

  // Monta o link de indicacao (landing co-branded) a partir do endereco atual.
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const linkIndicacao = `${proto}://${host}/r/${parceiro.id}`;

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

        {/* Link de indicacao para compartilhar com o parceiro */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Link de indicação</div>
          <p style={{ fontSize: 12, color: "#9A9A98", margin: "0 0 8px" }}>
            Envie este link ao parceiro. Quem abrir e preencher vira uma indicação atribuída a ele.
          </p>
          <CopyLink url={linkIndicacao} />
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

      {/* Carteira do parceiro */}
      <div style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, padding: 24, marginTop: 16, maxWidth: 640 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Carteira</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          {carteiraTotais.map((t) => (
            <div key={t.rotulo} style={{ flex: 1, minWidth: 120, background: "#F7F7F6", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#6B6B6B" }}>{t.rotulo}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2, color: t.cor }}>{formatBRL(t.valor)}</div>
            </div>
          ))}
        </div>

        {comissoes.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9A9A98", margin: 0 }}>
            Nenhuma comissão ainda. Elas nascem quando uma indicação deste parceiro vira “Convertida”.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {comissoes.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid #F0F0EF", paddingTop: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}>{c.indicacao?.leadNome ?? "—"}</div>
                  <div style={{ fontSize: 12, color: "#9A9A98" }}>
                    {c.indicacao?.produto?.nome ?? "—"} · {c.geradaEm.toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{formatBRL(c.valorLiquidoCents)}</span>
                  <BadgeComissao status={c.status} />
                </div>
              </div>
            ))}
          </div>
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
