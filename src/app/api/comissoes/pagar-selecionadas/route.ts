import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Marca as comissoes selecionadas como pagas: DISPONIVEL -> PAGA.
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
    where: { id: { in: ids }, organizacaoId: sessao.organizacaoId, status: "DISPONIVEL" },
    data: { status: "PAGA", pagaEm: new Date() },
  });
  return NextResponse.json({ ok: true, n: r.count });
}
