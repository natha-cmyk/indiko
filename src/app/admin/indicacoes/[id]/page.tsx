import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { BadgeIndicacao, STATUS_INDICACAO } from "@/components/badge-indicacao";

export const dynamic = "force-dynamic";

export default async function DetalheIndicacao({ params }: { params: { id: string } }) {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");
  const orgId = sessao.organizacaoId ?? "";

  const ind = await prisma.indicacao.findFirst({
    where: { id: params.id, organizacaoId: orgId },
    select: {
      id: true,
      leadNome: true,
      leadEmail: true,
      leadTelefone: true,
      status: true,
      criadaEm: true,
      convertidaEm: true,
      parceiro: { select: { id: true, nome: true } },
      produto: { select: { nome: true } },
    },
  });

  if (!ind) {
    return (
      <AdminShell titulo="Indicação" atual="Indicações" nome={sessao.nome} papel={sessao.papel}>
        <a href="/admin/indicacoes" style={voltar}>← Voltar para a lista</a>
        <p style={{ color: "#6B6B6B", marginTop: 20 }}>Indicação não encontrada.</p>
      </AdminShell>
    );
  }

  const dados = [
    { rotulo: "Telefone", valor: ind.leadTelefone ?? "—" },
    { rotulo: "E-mail", valor: ind.leadEmail ?? "—" },
    { rotulo: "Parceiro", valor: ind.parceiro?.nome ?? "—" },
    { rotulo: "Produto", valor: ind.produto?.nome ?? "—" },
    { rotulo: "Recebida em", valor: ind.criadaEm.toLocaleDateString("pt-BR") },
    ...(ind.convertidaEm
      ? [{ rotulo: "Convertida em", valor: ind.convertidaEm.toLocaleDateString("pt-BR") }]
      : []),
  ];

  return (
    <AdminShell titulo="Indicação" atual="Indicações" nome={sessao.nome} papel={sessao.papel}>
      <a href="/admin/indicacoes" style={voltar}>← Voltar para a lista</a>

      <div style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, padding: 24, marginTop: 12, maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{ind.leadNome}</h2>
          <BadgeIndicacao status={ind.status} />
        </div>

        <dl style={{ margin: "20px 0 0", fontSize: 14, lineHeight: 2 }}>
          {dados.map((d) => (
            <div key={d.rotulo}>
              <strong style={{ color: "#6B6B6B", fontWeight: 600 }}>{d.rotulo}:</strong> {d.valor}
            </div>
          ))}
        </dl>

        {/* Mudar o status pelo funil */}
        <form action={`/api/indicacoes/${ind.id}/status`} method="post" style={{ marginTop: 24, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Mudar status:</label>
          <select name="status" defaultValue={ind.status} style={{ border: "1px solid #E6E6E4", borderRadius: 10, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", background: "#fff" }}>
            {Object.entries(STATUS_INDICACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
          <button type="submit" style={{ background: "#FF001E", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Salvar
          </button>
        </form>
        <p style={{ fontSize: 12, color: "#9A9A98", margin: "10px 0 0" }}>
          A comissão é gerada quando a indicação vira “Convertida” — isso entra na Etapa 6.
        </p>
      </div>
    </AdminShell>
  );
}

const voltar: React.CSSProperties = { fontSize: 13, color: "#00BBC5", textDecoration: "none" };
