import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { STATUS_COMISSAO } from "@/components/badge-comissao";
import { formatBRL } from "@/lib/comissao";
import { ComissoesTabela } from "./tabela";

export const dynamic = "force-dynamic";

const FILTROS = [
  { chave: "", rotulo: "Todas" },
  { chave: "PENDENTE", rotulo: "A liberar" },
  { chave: "DISPONIVEL", rotulo: "Disponível" },
  { chave: "PAGA", rotulo: "Paga" },
  { chave: "CANCELADA", rotulo: "Cancelada" },
];

export default async function ListaComissoes({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");
  const orgId = sessao.organizacaoId ?? "";

  const status = STATUS_COMISSAO[searchParams.status ?? ""] ? searchParams.status : "";

  const [agrupado, comissoes] = await Promise.all([
    prisma.comissao.groupBy({
      by: ["status"],
      where: { organizacaoId: orgId },
      _sum: { valorLiquidoCents: true },
    }),
    prisma.comissao.findMany({
      where: { organizacaoId: orgId, ...(status ? { status: status as never } : {}) },
      orderBy: { geradaEm: "desc" },
      select: {
        id: true,
        valorLiquidoCents: true,
        status: true,
        geradaEm: true,
        parceiro: { select: { nome: true } },
        indicacao: { select: { leadNome: true, produto: { select: { nome: true } } } },
      },
    }),
  ]);

  const soma = (s: string) => agrupado.find((g) => g.status === s)?._sum.valorLiquidoCents ?? 0;
  const totais = [
    { rotulo: "A liberar", valor: soma("PENDENTE"), cor: "#F59E0B" },
    { rotulo: "Disponível", valor: soma("DISPONIVEL"), cor: "#00BBC5" },
    { rotulo: "Paga", valor: soma("PAGA"), cor: "#16A34A" },
  ];

  const itens = comissoes.map((c) => ({
    id: c.id,
    valorLabel: formatBRL(c.valorLiquidoCents),
    status: c.status,
    geradaEmLabel: c.geradaEm.toLocaleDateString("pt-BR"),
    parceiroNome: c.parceiro?.nome ?? "—",
    leadNome: c.indicacao?.leadNome ?? "—",
    produtoNome: c.indicacao?.produto?.nome ?? "—",
  }));

  return (
    <AdminShell titulo="Comissões" atual="Comissões" nome={sessao.nome} papel={sessao.papel}>
      {/* Totais + acao automatica por tempo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {totais.map((t) => (
            <div key={t.rotulo} style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 14, padding: "12px 20px", minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "#6B6B6B" }}>{t.rotulo}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2, color: t.cor }}>{formatBRL(t.valor)}</div>
            </div>
          ))}
        </div>

        <form action="/api/comissoes/liberar" method="post">
          <button type="submit" style={{ background: "#fff", color: "#00BBC5", border: "1px solid #00BBC5", borderRadius: 12, padding: "11px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            Liberar vencidas (15 dias)
          </button>
        </form>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        {FILTROS.map((f) => {
          const ativo = (status || "") === f.chave;
          const href = `/admin/comissoes${f.chave ? `?status=${f.chave}` : ""}`;
          return (
            <a key={f.rotulo} href={href} style={{ textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 999, border: "1px solid " + (ativo ? "#121111" : "#E6E6E4"), background: ativo ? "#121111" : "#fff", color: ativo ? "#fff" : "#6B6B6B" }}>
              {f.rotulo}
            </a>
          );
        })}
      </div>

      {itens.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #E6E6E4", borderRadius: 16, padding: 40, textAlign: "center", color: "#6B6B6B" }}>
          Nenhuma comissão {status ? "nesse filtro" : "ainda"}. Elas nascem quando uma indicação vira “Convertida”.
        </div>
      ) : (
        <ComissoesTabela comissoes={itens} />
      )}
    </AdminShell>
  );
}
