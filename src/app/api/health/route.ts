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

    // --- DIAGNOSTICO TEMPORARIO (sera removido apos resolver a conexao) ---
    // Mostra a pista do erro SEM expor senha: nome/mensagem do erro e se as
    // variaveis estao presentes e bem formatadas no ambiente de Producao.
    const url = process.env.DATABASE_URL ?? "";
    const e = erro as { name?: string; message?: string };
    const diagnostico = {
      erroNome: e?.name ?? null,
      erroMensagem: (e?.message ?? "").slice(0, 300),
      temDATABASE_URL: Boolean(process.env.DATABASE_URL),
      temDIRECT_URL: Boolean(process.env.DIRECT_URL),
      url_temPooler: url.includes("pooler.supabase.com"),
      url_tem6543: url.includes(":6543"),
      url_temPgbouncer: url.includes("pgbouncer=true"),
    };
    // --- fim do diagnostico temporario ---

    return NextResponse.json(
      {
        status: "erro",
        app: "no ar",
        db: "unreachable",
        diagnostico,
      },
      { status: 503 },
    );
  }
}
