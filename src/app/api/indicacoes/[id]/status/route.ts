import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";
import { STATUS_INDICACAO } from "@/components/badge-indicacao";

export const dynamic = "force-dynamic";

// Atualiza o status de uma indicacao (funil). Chamado por um formulario do admin.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessao = await getSessaoAtual();
  if (!sessao?.organizacaoId) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const form = await req.formData();
  const novoStatus = String(form.get("status") ?? "");

  // So aceita um status valido do funil.
  if (STATUS_INDICACAO[novoStatus]) {
    // So altera se a indicacao for da mesma organizacao.
    const indicacao = await prisma.indicacao.findFirst({
      where: { id: params.id, organizacaoId: sessao.organizacaoId },
      select: { id: true },
    });
    if (indicacao) {
      await prisma.indicacao.update({
        where: { id: indicacao.id },
        data: {
          status: novoStatus as never,
          // Ao converter, marca a data (base para a comissao na Etapa 6).
          ...(novoStatus === "CONVERTIDA" ? { convertidaEm: new Date() } : {}),
        },
      });
    }
  }

  return NextResponse.redirect(new URL(`/admin/indicacoes/${params.id}`, req.url));
}
