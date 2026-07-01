import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";
import { DEFAULTS } from "@/lib/rules";

export const dynamic = "force-dynamic";

// Libera as comissoes "a liberar" (PENDENTE) que ja cumpriram os dias de
// garantia: passam para DISPONIVEL. So afeta a organizacao do usuario.
export async function POST(req: Request) {
  const sessao = await getSessaoAtual();
  if (!sessao?.organizacaoId) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const corte = new Date();
  corte.setDate(corte.getDate() - DEFAULTS.liberationDays);

  await prisma.comissao.updateMany({
    where: {
      organizacaoId: sessao.organizacaoId,
      status: "PENDENTE",
      geradaEm: { lte: corte },
    },
    data: { status: "DISPONIVEL" },
  });

  return NextResponse.redirect(new URL("/admin/comissoes", req.url));
}
