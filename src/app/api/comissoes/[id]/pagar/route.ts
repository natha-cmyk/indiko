import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Marca uma comissao DISPONIVEL como PAGA (registra a data). Org-scoped.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessao = await getSessaoAtual();
  if (!sessao?.organizacaoId) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const comissao = await prisma.comissao.findFirst({
    where: { id: params.id, organizacaoId: sessao.organizacaoId, status: "DISPONIVEL" },
    select: { id: true },
  });

  if (comissao) {
    await prisma.comissao.update({
      where: { id: comissao.id },
      data: { status: "PAGA", pagaEm: new Date() },
    });
  }

  return NextResponse.redirect(new URL("/admin/comissoes", req.url));
}
