import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Verificacao de saude: alem de confirmar que o app esta no ar, faz uma
// pergunta minima ao banco (SELECT 1) para provar que a conexao com o
// Supabase esta viva. Util para validar o deploy na Vercel.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      app: "no ar",
      db: "connected",
    });
  } catch (erro) {
    console.error("Falha ao conectar no banco:", erro);
    return NextResponse.json(
      {
        status: "erro",
        app: "no ar",
        db: "unreachable",
      },
      { status: 503 },
    );
  }
}
