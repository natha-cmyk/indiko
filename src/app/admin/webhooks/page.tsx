import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";

export const dynamic = "force-dynamic";

const ORIGEM_ROTULO: Record<string, string> = { conexa: "Conexa", clickup: "ClickUp" };

export default async function ListaWebhooks() {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");
  const orgId = sessao.organizacaoId ?? "";

  const eventos = await prisma.webhookLog.findMany({
    where: { organizacaoId: orgId },
    orderBy: { recebidoEm: "desc" },
    take: 50,
    select: {
      id: true,
      origem: true,
      eventoTipo: true,
      status: true,
      indicacaoId: true,
      recebidoEm: true,
      processadoEm: true,
    },
  });

  return (
    <AdminShell titulo="Webhooks" atual="Webhooks" nome={sessao.nome} papel={sessao.papel}>
      <p style={{ color: "#6B6B6B", margin: "0 0 20px", fontSize: 14 }}>
        Últimos eventos automáticos recebidos da Conexa e do ClickUp. Eventos repetidos são ignorados
        (não geram comissão duas vezes).
      </p>

      {eventos.length === 0 ? (
        <div style={{ background: "#fff", border: "1px dashed #E6E6E4", borderRadius: 16, padding: 40, textAlign: "center", color: "#6B6B6B" }}>
          Nenhum evento recebido ainda.
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E6E6E4", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#9A9A98", fontSize: 12 }}>
                <th style={th}>Origem</th>
                <th style={th}>Evento</th>
                <th style={th}>Resultado</th>
                <th style={th}>Indicação</th>
                <th style={th}>Recebido em</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid #F0F0EF" }}>
                  <td style={td}>{ORIGEM_ROTULO[e.origem] ?? e.origem}</td>
                  <td style={td}>{e.eventoTipo}</td>
                  <td style={td}>{e.status}</td>
                  <td style={td}>
                    {e.indicacaoId ? (
                      <a href={`/admin/indicacoes/${e.indicacaoId}`} style={{ color: "#00BBC5", textDecoration: "none" }}>
                        ver
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={td}>{e.recebidoEm.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: "14px 16px" };
