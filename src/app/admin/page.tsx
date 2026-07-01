import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";

export const dynamic = "force-dynamic";

// Dashboard do admin. Le numeros reais do banco, sempre filtrando pela
// organizacao do usuario logado (regra multi-empresa).
export default async function PainelAdmin() {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");

  const orgId = sessao.organizacaoId ?? "";

  const [
    nProgramas,
    nNiveis,
    nProdutos,
    nRegras,
    nParceiros,
    nIndicacoes,
    programas,
  ] = await Promise.all([
    prisma.programa.count({ where: { organizacaoId: orgId } }),
    prisma.nivel.count({ where: { organizacaoId: orgId } }),
    prisma.produto.count({ where: { organizacaoId: orgId } }),
    prisma.comissaoRegra.count({ where: { organizacaoId: orgId } }),
    prisma.parceiro.count({ where: { organizacaoId: orgId } }),
    prisma.indicacao.count({ where: { organizacaoId: orgId } }),
    prisma.programa.findMany({
      where: { organizacaoId: orgId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, publicoAlvo: true, descricao: true, ativo: true },
    }),
  ]);

  const cards = [
    { rotulo: "Programas", valor: nProgramas },
    { rotulo: "Níveis", valor: nNiveis },
    { rotulo: "Produtos", valor: nProdutos },
    { rotulo: "Regras de comissão", valor: nRegras },
    { rotulo: "Parceiros", valor: nParceiros },
    { rotulo: "Indicações", valor: nIndicacoes },
  ];

  return (
    <AdminShell titulo="Visão geral" atual="Visão geral" nome={sessao.nome} papel={sessao.papel}>
      <p style={{ color: "#6B6B6B", margin: "0 0 20px", fontSize: 14 }}>
        Situação atual do Seahub, lida diretamente do banco de dados.
      </p>

      {/* Cartões com os números reais */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.rotulo}
            style={{
              background: "#fff",
              border: "1px solid #E6E6E4",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, color: "#6B6B6B" }}>{c.rotulo}</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{c.valor}</div>
            {c.valor === 0 && (
              <div style={{ fontSize: 11, color: "#9A9A98", marginTop: 2 }}>
                sem dados ainda
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lista dos programas */}
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Programas</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {programas.length === 0 && (
          <p style={{ color: "#9A9A98", fontSize: 14 }}>Nenhum programa cadastrado.</p>
        )}
        {programas.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#fff",
              border: "1px solid #E6E6E4",
              borderRadius: 16,
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nome}</div>
              {p.publicoAlvo && (
                <div style={{ fontSize: 13, color: "#6B6B6B", marginTop: 2 }}>
                  {p.publicoAlvo}
                </div>
              )}
              {p.descricao && (
                <div style={{ fontSize: 12, color: "#9A9A98", marginTop: 4 }}>{p.descricao}</div>
              )}
            </div>
            <span
              style={{
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 999,
                padding: "4px 12px",
                background: p.ativo ? "#16A34A1A" : "#9A9A981A",
                color: p.ativo ? "#16A34A" : "#6B6B6B",
              }}
            >
              {p.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
