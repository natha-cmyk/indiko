import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { FormularioNovoParceiro } from "./formulario";

export const dynamic = "force-dynamic";

export default async function NovoParceiro() {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/admin/login");
  const orgId = sessao.organizacaoId ?? "";

  const [programas, niveis] = await Promise.all([
    prisma.programa.findMany({
      where: { organizacaoId: orgId, ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.nivel.findMany({
      where: { organizacaoId: orgId },
      orderBy: { ordem: "asc" },
      select: { id: true, nome: true, programaId: true },
    }),
  ]);

  return (
    <AdminShell titulo="Convidar parceiro" atual="Parceiros" nome={sessao.nome} papel={sessao.papel}>
      <FormularioNovoParceiro programas={programas} niveis={niveis} />
    </AdminShell>
  );
}
