import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aplicarStatusIndicacao } from "@/lib/comissao";
import { STATUS_INDICACAO } from "@/components/badge-indicacao";
import {
  segredoValido,
  hashEvento,
  resolverOrganizacao,
  registrarWebhook,
  normalizarEmail,
  normalizarTelefone,
} from "@/lib/webhook";

export const dynamic = "force-dynamic";

// Mapeia nomes de coluna/status do ClickUp para o nosso funil.
const MAPA_CLICKUP: Record<string, string> = {
  Novo: "AGUARDANDO_CONTATO",
  "Aguardando contato": "AGUARDANDO_CONTATO",
  "Em contato": "EM_NEGOCIACAO",
  "Em negociação": "EM_NEGOCIACAO",
  Ganho: "CONVERTIDA",
  Convertido: "CONVERTIDA",
  Convertida: "CONVERTIDA",
  Perdido: "PERDIDA",
  Perdida: "PERDIDA",
  Descartado: "DESCARTADA",
  Descartada: "DESCARTADA",
};

function resolverStatus(bruto: string): string | null {
  if (STATUS_INDICACAO[bruto]) return bruto; // ja e um status nosso
  return MAPA_CLICKUP[bruto] ?? null;
}

// Webhook do ClickUp: card mudou de coluna -> muda o status da indicacao.
// Formato esperado (contrato nosso): { eventoId, cardId?, status, email?, telefone? }
export async function POST(req: Request) {
  if (!segredoValido(req, process.env.CLICKUP_WEBHOOK_SECRET)) {
    return NextResponse.json({ erro: "Chave inválida." }, { status: 401 });
  }

  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const eventoId = payload.eventoId ? String(payload.eventoId) : undefined;
  const cardId = String(payload.cardId ?? payload.clickupCardId ?? "").trim();
  const email = normalizarEmail(payload.email);
  const telefone = normalizarTelefone(payload.telefone);
  const novoStatus = resolverStatus(String(payload.status ?? payload.statusCard ?? "").trim());

  const criterios = [
    ...(cardId ? [{ clickupCardId: cardId }] : []),
    ...(email ? [{ leadEmail: email }] : []),
    ...(telefone ? [{ leadTelefone: telefone }] : []),
  ];
  const ind =
    criterios.length > 0
      ? await prisma.indicacao.findFirst({
          where: { OR: criterios },
          orderBy: { criadaEm: "desc" },
          select: { id: true, organizacaoId: true, status: true },
        })
      : null;

  const orgId = await resolverOrganizacao(ind?.organizacaoId);
  if (!orgId) {
    return NextResponse.json({ ok: true, ignorado: "sem organização" });
  }

  const hash = hashEvento("clickup", eventoId, payload);
  const reg = await registrarWebhook({
    organizacaoId: orgId,
    origem: "clickup",
    eventoTipo: "card_status",
    payload,
    indicacaoId: ind?.id,
    hash,
  });
  if (reg.duplicado) {
    return NextResponse.json({ ok: true, duplicado: true });
  }

  let resultado = "sem_indicacao";
  if (!novoStatus) {
    resultado = "status_desconhecido";
  } else if (ind) {
    await aplicarStatusIndicacao(ind.id, novoStatus);
    resultado = `status:${novoStatus}`;
  }

  if (reg.id) {
    await prisma.webhookLog.update({
      where: { id: reg.id },
      data: { status: resultado, processadoEm: new Date() },
    });
  }

  return NextResponse.json({ ok: true, indicacaoId: ind?.id ?? null, resultado });
}
