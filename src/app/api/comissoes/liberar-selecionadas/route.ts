import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Libera as comissoes selecionadas (na mao): PENDENTE -> DISPONIVEL.
// Diferente do "Liberar vencidas", NAO exige os 15 dias (escolha do admin).
export async function POST(req: Request) {
  const sessao = await getSessaoAtual();
  if (!sessao?.organizacaoId) {
    return NextResponse.json({ erro: "Sessão expirada." }, { status: 401 });
  }
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ ok: true, n: 0 });
  }
  const r = await prisma.comissao.updateMany({
    where: { id: { in: ids }, organizacaoId: sessao.organizacaoId, status: "PENDENTE" },
    data: { status: "DISPONIVEL" },
  });
  return NextResponse.json({ ok: true, n: r.count });
}
