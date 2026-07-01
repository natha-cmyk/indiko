import { SignJWT, jwtVerify } from "jose";

// Nome do cookie que guarda o "cracha" da sessao no navegador.
export const SESSION_COOKIE = "indiko_session";

// O que vai dentro do cracha (dados minimos do usuario logado).
export type SessaoUsuario = {
  sub: string; // id do usuario
  nome: string;
  email: string;
  papel: string; // SUPER_ADMIN | ADMIN | OPERACAO
  organizacaoId: string | null; // empresa (multi-tenant)
};

// Este arquivo NAO importa Prisma nem bcrypt de proposito: ele roda tambem
// no "middleware" (Edge), que precisa ser leve. Aqui so assina/verifica o cracha.

function segredo(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET nao configurada no ambiente.");
  return new TextEncoder().encode(s);
}

// Cria o cracha assinado (valido por 7 dias).
export async function assinarSessao(dados: SessaoUsuario): Promise<string> {
  return new SignJWT({ ...dados })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(segredo());
}

// Confere o cracha. Retorna os dados se valido, ou null se invalido/ausente.
export async function verificarSessao(
  token: string | undefined,
): Promise<SessaoUsuario | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    return payload as unknown as SessaoUsuario;
  } catch {
    return null;
  }
}
