import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { conferirSenha } from "@/lib/auth";
import { assinarSessao, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

// Recebe { email, senha }, confere contra o banco e, se bater, entrega o cracha.
export async function POST(req: Request) {
  try {
    const { email, senha } = await req.json();
    if (!email || !senha) {
      return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    // Mensagem generica de proposito: nao revela se o e-mail existe.
    if (!usuario || !(await conferirSenha(String(senha), usuario.senhaHash))) {
      return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const token = await assinarSessao({
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      organizacaoId: usuario.organizacaoId,
    });

    const res = NextResponse.json({ ok: true, papel: usuario.papel });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true, // o navegador nao expoe para scripts
      secure: true, // so trafega em https
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });
    return res;
  } catch (e) {
    console.error("Erro no login:", e);
    return NextResponse.json({ erro: "Erro ao entrar. Tente novamente." }, { status: 500 });
  }
}
