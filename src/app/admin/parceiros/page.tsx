import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { BadgeStatus } from "@/components/badge-status";
import { FiltroPrograma } from "@/components/filtro-programa";

export const dynamic = "force-dynamic";

export default async function ListaParceiros({
  searchParams,
}: {
  searchParams: { q?: string; programa?: string };
}) {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");
  const orgId = sessao.organizacaoId ?? "";

  const programas = await prisma.programa.findMany({
    where: { organizacaoId: orgId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
  const programaId = programas.find((p) => p.id === searchParams.programa)?.id ?? "";

  const busca = (searchParams.q ?? "").trim();

  const baseWhere = {
    organizacaoId: orgId,
    ...(programaId ? { programaId } : {}),
  };

  const where = {
    ...baseWhere,
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { email: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [nAtivos, nInativos, nBanidos, parceiros] = await Promise.all([
    prisma.parceiro.count({ where: { ...baseWhere, status: "ATIVO" } }),
    prisma.parceiro.count({ where: { ...baseWhere, status: "INATIVO" } }),
    prisma.parceiro.count({ where: { ...baseWhere, status: "BANIDO" } }),
    prisma.parceiro.findMany({
      where,
      orderBy: { dataCadastro: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        status: true,
        programa: { select: { nome: true } },
        nivel: { select: { nome: true } },
        _count: { select: { indicacoes: true } },
      },
    }),
  ]);

  const kpis = [
    { rotulo: "Ativos", valor: nAtivos, cor: "#16A34A" },
    { rotulo: "Inativos", valor: nInativos, cor: "#F59E0B" },
    { rotulo: "Banidos", valor: nBanidos, cor: "#FF001E" },
  ];

  return (
    <AdminShell titulo="Parceiros" atual="Parceiros" nome={sessao.nome} papel={sessao.papel}>
      {/* Filtro por programa (vale para todo o painel) */}
      <div style={{ marginBottom: 16 }}>
        <FiltroPrograma programas={programas} />
      </div>

      {/* Cartoes + botao convidar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {kpis.map((k) => (
            <div key={k.rotulo} style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 14, padding: "12px 20px", minWidth: 110 }}>
              <div style={{ fontSize: 12, color: "#6B6B6B" }}>{k.rotulo}</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2, color: k.cor }}>{k.valor}</div>
            </div>
          ))}
        </div>

        <a href="/admin/parceiros/novo" style={{ background: "#FF001E", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, borderRadius: 12, padding: "11px 18px", whiteSpace: "nowrap" }}>
          + Convidar parceiro
        </a>
      </div>

      {/* Busca */}
      <form method="get" style={{ marginBottom: 16 }}>
        {programaId && <input type="hidden" name="programa" value={programaId} />}
        <input
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome ou e-mail..."
          style={{ width: "100%", maxWidth: 420, boxSizing: "border-box", border: "1px solid #E6E6E4", borderRadius: 12, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", background: "#fff" }}
        />
      </form>

      {parceiros.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #E6E6E4", borderRadius: 16, padding: 40, textAlign: "center", color: "#6B6B6B" }}>
          {busca || programaId
            ? "Nenhum parceiro encontrado com esses filtros."
            : "Nenhum parceiro ainda. Clique em “Convidar parceiro” para cadastrar o primeiro."}
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#9A9A98", fontSize: 12 }}>
                <th style={thEstilo}>Parceiro</th>
                <th style={thEstilo}>Programa</th>
                <th style={thEstilo}>Nível</th>
                <th style={thEstilo}>Indicações</th>
                <th style={thEstilo}>Status</th>
              </tr>
            </thead>
            <tbody>
              {parceiros.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #F0F0EF" }}>
                  <td style={tdEstilo}>
                    <a href={`/admin/parceiros/${p.id}`} style={{ color: "#121111", textDecoration: "none", fontWeight: 600 }}>
                      {p.nome}
                    </a>
                    <div style={{ fontSize: 12, color: "#9A9A98" }}>{p.email}</div>
                  </td>
                  <td style={tdEstilo}>{p.programa?.nome ?? "—"}</td>
                  <td style={tdEstilo}>{p.nivel?.nome ?? "—"}</td>
                  <td style={tdEstilo}>{p._count.indicacoes}</td>
                  <td style={tdEstilo}>
                    <BadgeStatus status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

const thEstilo: React.CSSProperties = { padding: "12px 16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 };
const tdEstilo: React.CSSProperties = { padding: "14px 16px" };
