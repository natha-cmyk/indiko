import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { STATUS_INDICACAO } from "@/components/badge-indicacao";
import { IndicacoesTabela } from "./tabela";

export const dynamic = "force-dynamic";

const FILTROS = [
  { chave: "", rotulo: "Todas" },
  { chave: "AGUARDANDO_CONTATO", rotulo: "Aguardando" },
  { chave: "EM_NEGOCIACAO", rotulo: "Em negociação" },
  { chave: "CONVERTIDA", rotulo: "Convertida" },
  { chave: "PERDIDA", rotulo: "Perdida" },
  { chave: "DESCARTADA", rotulo: "Descartada" },
];

export default async function ListaIndicacoes({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");
  const orgId = sessao.organizacaoId ?? "";

  const busca = (searchParams.q ?? "").trim();
  const status = STATUS_INDICACAO[searchParams.status ?? ""] ? searchParams.status : "";

  const indicacoes = await prisma.indicacao.findMany({
    where: {
      organizacaoId: orgId,
      ...(status ? { status: status as never } : {}),
      ...(busca
        ? {
            OR: [
              { leadNome: { contains: busca, mode: "insensitive" as const } },
              { leadEmail: { contains: busca, mode: "insensitive" as const } },
              { parceiro: { nome: { contains: busca, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    orderBy: { criadaEm: "desc" },
    select: {
      id: true,
      leadNome: true,
      leadTelefone: true,
      leadEmail: true,
      status: true,
      criadaEm: true,
      parceiro: { select: { nome: true } },
      produto: { select: { nome: true } },
    },
  });

  const itens = indicacoes.map((i) => ({
    id: i.id,
    leadNome: i.leadNome,
    contato: i.leadTelefone || i.leadEmail || "—",
    parceiroNome: i.parceiro?.nome ?? "—",
    produtoNome: i.produto?.nome ?? "—",
    dataLabel: i.criadaEm.toLocaleDateString("pt-BR"),
    status: i.status,
  }));

  return (
    <AdminShell titulo="Indicações" atual="Indicações" nome={sessao.nome} papel={sessao.papel}>
      {/* Filtros por status */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {FILTROS.map((f) => {
          const ativo = (status || "") === f.chave;
          const qs = new URLSearchParams();
          if (f.chave) qs.set("status", f.chave);
          if (busca) qs.set("q", busca);
          const href = `/admin/indicacoes${qs.toString() ? `?${qs}` : ""}`;
          return (
            <a key={f.rotulo} href={href} style={{ textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 999, border: "1px solid " + (ativo ? "#121111" : "#E6E6E4"), background: ativo ? "#121111" : "#fff", color: ativo ? "#fff" : "#6B6B6B" }}>
              {f.rotulo}
            </a>
          );
        })}
      </div>

      {/* Busca */}
      <form method="get" style={{ marginBottom: 16 }}>
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={busca}
          placeholder="Buscar por indicado ou parceiro..."
          style={{ width: "100%", maxWidth: 420, boxSizing: "border-box", border: "1px solid #E6E6E4", borderRadius: 12, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", background: "#fff" }}
        />
      </form>

      {itens.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #E6E6E4", borderRadius: 16, padding: 40, textAlign: "center", color: "#6B6B6B" }}>
          {busca || status
            ? "Nenhuma indicação encontrada com esses filtros."
            : "Nenhuma indicação ainda. Elas aparecem aqui quando alguém preenche a landing de um parceiro."}
        </div>
      ) : (
        <IndicacoesTabela indicacoes={itens} />
      )}
    </AdminShell>
  );
}
