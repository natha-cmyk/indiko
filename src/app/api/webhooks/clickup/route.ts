import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Entrada: card movido para "Ganho"/"Perdido" -> atualiza status da indicação.
// TODO (backend): validar assinatura (CLICKUP_WEBHOOK_SECRET), mapear card->indicacao,
// aplicar mesmo dedupe do Conexa para não duplicar comissão.
export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  console.log("[webhook clickup] recebido:", payload);
  return NextResponse.json({ received: true });
}
