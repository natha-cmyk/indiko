import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verificarSessao } from "@/lib/session";

// Protege tudo sob /admin (menos a propria tela de login).
// Sem cracha valido -> manda para o login, guardando para onde a pessoa ia.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const sessao = await verificarSessao(token);

  if (!sessao) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
