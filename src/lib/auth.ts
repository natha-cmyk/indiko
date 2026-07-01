import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verificarSessao, type SessaoUsuario } from "@/lib/session";

// Ajudantes de senha (rodam no servidor Node, nunca no navegador).
export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

// Le o usuario logado a partir do cookie da requisicao atual.
// Use em Server Components e rotas de API. Retorna null se nao logado.
export async function getSessaoAtual(): Promise<SessaoUsuario | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verificarSessao(token);
}
