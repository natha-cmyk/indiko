import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Confere a chave secreta do webhook (header "x-webhook-secret" ou ?secret=).
// Sem chave configurada no servidor -> recusa (mais seguro).
export function segredoValido(req: Request, esperado: string | undefined): boolean {
  if (!esperado) return false;
  const recebido =
    req.headers.get("x-webhook-secret") ??
    new URL(req.url).searchParams.get("secret") ??
    "";
  if (recebido.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado));
}

// Monta a chave de idempotencia do evento. Prefere o id do evento externo;
// se nao houver, usa um hash do conteudo (payloads iguais sao considerados iguais).
export function hashEvento(origem: string, eventoId: string | undefined, payload: unknown): string {
  if (eventoId) return `${origem}:${eventoId}`;
  const h = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `${origem}:sha:${h}`;
}

// Descobre a organizacao: a da indicacao encontrada ou, na falta, a unica
// organizacao (Seahub). No futuro multi-tenant, a chave secreta seria por org.
export async function resolverOrganizacao(orgDaIndicacao?: string | null): Promise<string | null> {
  if (orgDaIndicacao) return orgDaIndicacao;
  const org = await prisma.organizacao.findFirst({ select: { id: true } });
  return org?.id ?? null;
}

// Registra o evento no WebhookLog. Se o hash ja existe (evento repetido),
// retorna { duplicado: true } sem gravar de novo.
export async function registrarWebhook(params: {
  organizacaoId: string;
  origem: string;
  eventoTipo: string;
  payload: unknown;
  indicacaoId?: string | null;
  hash: string;
}): Promise<{ duplicado: boolean; id?: string }> {
  try {
    const log = await prisma.webhookLog.create({
      data: {
        organizacaoId: params.organizacaoId,
        origem: params.origem,
        eventoTipo: params.eventoTipo,
        payloadRaw: params.payload as never,
        indicacaoId: params.indicacaoId ?? null,
        status: "recebido",
        hashIdempotencia: params.hash,
      },
      select: { id: true },
    });
    return { duplicado: false, id: log.id };
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      return { duplicado: true };
    }
    throw e;
  }
}

// Normaliza e-mail/telefone para casar com o que esta salvo na indicacao.
export function normalizarEmail(v: unknown): string {
  return String(v ?? "").toLowerCase().trim();
}
export function normalizarTelefone(v: unknown): string {
  return String(v ?? "").trim();
}
