import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";
import { STATUS_INDICACAO } from "@/components/badge-indicacao";
import { gerarComissaoParaIndicacao, cancelarComissoesDaIndicacao } from "@/lib/comissao";

export const dynamic = "force-dynamic";

// Muda o status de varias indicacoes de uma vez (org-scoped).
// Reaproveita a mesma logica de comissao da mudanca individual.
export async function POST(req: Request) {
  const sessao = await getSessaoAtual();
  if (!sessao?.organizacaoId) {
    return NextResponse.json({ erro: "Sessão expirada." }, { status: 401 });
  }
  const { ids, status } = await req.json();
  if (!STATUS_INDICACAO[status]) {
    return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ ok: true, n: 0 });
  }

  let n = 0;
  for (const id of ids) {
    const ind = await prisma.indicacao.findFirst({
      where: { id, organizacaoId: sessao.organizacaoId },
      select: { id: true },
    });
    if (!ind) continue;
    await prisma.indicacao.update({
      where: { id: ind.id },
      data: {
        status,
        ...(status === "CONVERTIDA" ? { convertidaEm: new Date() } : {}),
      },
    });
    if (status === "CONVERTIDA") {
      await gerarComissaoParaIndicacao(ind.id);
    } else {
      await cancelarComissoesDaIndicacao(ind.id);
    }
    n++;
  }
  return NextResponse.json({ ok: true, n });
}
