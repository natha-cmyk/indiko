import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Alterna o status do parceiro entre ATIVO e INATIVO (pausar/reativar).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessao = await getSessaoAtual();
  if (!sessao?.organizacaoId) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // So altera se o parceiro for da mesma organizacao.
  const parceiro = await prisma.parceiro.findFirst({
    where: { id: params.id, organizacaoId: sessao.organizacaoId },
    select: { id: true, status: true },
  });

  if (parceiro && parceiro.status !== "BANIDO") {
    await prisma.parceiro.update({
      where: { id: parceiro.id },
      data: { status: parceiro.status === "ATIVO" ? "INATIVO" : "ATIVO" },
    });
  }

  return NextResponse.redirect(new URL(`/admin/parceiros/${params.id}`, req.url));
}
