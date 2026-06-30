import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Entrada: confirmação de pagamento -> libera comissão da indicação.
// TODO (backend): validar assinatura (CONEXA_WEBHOOK_SECRET), normalizar payload,
// identificar a indicação por documento/e-mail, aplicar dedupe idempotente
// (hash: organizacao + indicacao + evento + data) e gerar/atualizar a comissão.
export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  console.log("[webhook conexa] recebido:", payload);
  return NextResponse.json({ received: true });
}
