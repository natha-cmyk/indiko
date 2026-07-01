import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Rota PUBLICA: recebe uma indicacao enviada pela landing co-branded.
// A organizacao NAO vem do cliente — e derivada do parceiro (impede forjar empresa).
export async function POST(req: Request) {
  try {
    const corpo = await req.json();
    const parceiroId = String(corpo.parceiroId ?? "").trim();
    const produtoId = String(corpo.produtoId ?? "").trim();
    const leadNome = String(corpo.leadNome ?? "").trim();
    const leadTelefone = String(corpo.leadTelefone ?? "").trim() || null;
    const leadEmail = String(corpo.leadEmail ?? "").toLowerCase().trim();

    if (!parceiroId || !produtoId || !leadNome || !leadEmail) {
      return NextResponse.json(
        { erro: "Preencha seu nome, e-mail e o que procura." },
        { status: 400 },
      );
    }

    // Parceiro precisa existir e estar ATIVO.
    const parceiro = await prisma.parceiro.findFirst({
      where: { id: parceiroId, status: "ATIVO" },
      select: { id: true, organizacaoId: true },
    });
    if (!parceiro) {
      return NextResponse.json({ erro: "Link de indicação inválido." }, { status: 404 });
    }

    // Produto precisa ser da mesma organizacao do parceiro.
    const produto = await prisma.produto.findFirst({
      where: { id: produtoId, organizacaoId: parceiro.organizacaoId, ativo: true },
      select: { id: true },
    });
    if (!produto) {
      return NextResponse.json({ erro: "Produto inválido." }, { status: 400 });
    }

    await prisma.indicacao.create({
      data: {
        organizacaoId: parceiro.organizacaoId,
        parceiroId: parceiro.id,
        produtoId: produto.id,
        leadNome,
        leadTelefone,
        leadEmail,
        // status usa o padrao do banco: AGUARDANDO_CONTATO
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro ao criar indicação:", e);
    return NextResponse.json({ erro: "Erro ao enviar. Tente novamente." }, { status: 500 });
  }
}
