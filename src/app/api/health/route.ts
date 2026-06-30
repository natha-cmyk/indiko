import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Por enquanto so confirma que o app esta no ar.
// Na etapa do banco, voltamos a checar a conexao com o Supabase.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "no ar",
    banco: "sera conectado na proxima etapa",
  });
}
