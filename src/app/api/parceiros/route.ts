import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessaoAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Cria um parceiro na organizacao do usuario logado.
// (Por enquanto cadastra direto; o convite por e-mail entra na etapa do Resend.)
export async function POST(req: Request) {
  const sessao = await getSessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Sessão expirada. Entre novamente." }, { status: 401 });
  }
  const orgId = sessao.organizacaoId;
  if (!orgId) {
    return NextResponse.json({ erro: "Usuário sem organização." }, { status: 400 });
  }

  try {
    const corpo = await req.json();
    const nome = String(corpo.nome ?? "").trim();
    const email = String(corpo.email ?? "").toLowerCase().trim();
    const telefone = String(corpo.telefone ?? "").trim() || null;
    const programaId = String(corpo.programaId ?? "").trim();
    const nivelId = String(corpo.nivelId ?? "").trim() || null;

    if (!nome || !email || !programaId) {
      return NextResponse.json(
        { erro: "Preencha nome, e-mail e programa." },
        { status: 400 },
      );
    }

    // Confere que o programa e da mesma organizacao (nao cruza empresas).
    const programa = await prisma.programa.findFirst({
      where: { id: programaId, organizacaoId: orgId },
      select: { id: true },
    });
    if (!programa) {
      return NextResponse.json({ erro: "Programa inválido." }, { status: 400 });
    }

    // Se informou nivel, ele precisa pertencer a esse programa.
    if (nivelId) {
      const nivel = await prisma.nivel.findFirst({
        where: { id: nivelId, programaId, organizacaoId: orgId },
        select: { id: true },
      });
      if (!nivel) {
        return NextResponse.json({ erro: "Nível inválido para este programa." }, { status: 400 });
      }
    }

    const parceiro = await prisma.parceiro.create({
      data: { organizacaoId: orgId, nome, email, telefone, programaId, nivelId },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: parceiro.id });
  } catch (e: unknown) {
    // Violacao de unicidade (organizacaoId + email).
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { erro: "Já existe um parceiro com esse e-mail." },
        { status: 409 },
      );
    }
    console.error("Erro ao criar parceiro:", e);
    return NextResponse.json({ erro: "Erro ao cadastrar. Tente novamente." }, { status: 500 });
  }
}
