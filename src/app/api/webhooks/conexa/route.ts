import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aplicarStatusIndicacao } from "@/lib/comissao";
import {
  segredoValido,
  hashEvento,
  resolverOrganizacao,
  registrarWebhook,
  normalizarEmail,
  normalizarTelefone,
} from "@/lib/webhook";

export const dynamic = "force-dynamic";

// Webhook da Conexa: confirmacao de pagamento -> converte a indicacao e gera a comissao.
// Formato esperado (contrato nosso, ajustavel ao real da Conexa depois):
//   { eventoId, clienteId?, email?, telefone? }
export async function POST(req: Request) {
  if (!segredoValido(req, process.env.CONEXA_WEBHOOK_SECRET)) {
    return NextResponse.json({ erro: "Chave inválida." }, { status: 401 });
  }

  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const cliente = (payload.cliente ?? {}) as Record<string, unknown>;

  const eventoId = payload.eventoId ? String(payload.eventoId) : undefined;
  const clienteId = String(payload.clienteId ?? payload.conexaClienteId ?? cliente.id ?? "").trim();
  const email = normalizarEmail(payload.email ?? cliente.email);
  const telefone = normalizarTelefone(payload.telefone ?? cliente.telefone);

  // Acha a indicacao pelo id da Conexa, e-mail OU telefone.
  const criterios = [
    ...(clienteId ? [{ conexaClienteId: clienteId }] : []),
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

  // Dedupe: se o evento ja foi processado, para aqui.
  const hash = hashEvento("conexa", eventoId, payload);
  const reg = await registrarWebhook({
    organizacaoId: orgId,
    origem: "conexa",
    eventoTipo: "pagamento",
    payload,
    indicacaoId: ind?.id,
    hash,
  });
  if (reg.duplicado) {
    return NextResponse.json({ ok: true, duplicado: true });
  }

  // Processa.
  let resultado = "sem_indicacao";
  if (ind) {
    if (ind.status !== "CONVERTIDA") {
      await aplicarStatusIndicacao(ind.id, "CONVERTIDA");
      resultado = "convertida";
    } else {
      // Ja convertida: parcelas recorrentes serao ligadas com os testes reais.
      resultado = "ja_convertida";
    }
  }

  if (reg.id) {
    await prisma.webhookLog.update({
      where: { id: reg.id },
      data: { status: resultado, processadoEm: new Date() },
    });
  }

  return NextResponse.json({ ok: true, indicacaoId: ind?.id ?? null, resultado });
}
