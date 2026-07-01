import { prisma } from "@/lib/prisma";
import { LandingForm } from "./landing-form";

export const dynamic = "force-dynamic";

// Landing co-branded PUBLICA. Acessada pelo cliente indicado, via link do parceiro.
export default async function LandingIndicacao({ params }: { params: { id: string } }) {
  const parceiro = await prisma.parceiro.findFirst({
    where: { id: params.id, status: "ATIVO" },
    select: {
      id: true,
      nome: true,
      organizacaoId: true,
      organizacao: { select: { nome: true, branding: true } },
    },
  });

  // Link invalido / parceiro inativo: mensagem neutra (sem vazar nada).
  if (!parceiro) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Montserrat', system-ui, sans-serif",
          color: "#6B6B6B",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, color: "#121111" }}>Link indisponível</h1>
          <p>Este link de indicação não está mais ativo.</p>
        </div>
      </main>
    );
  }

  const produtos = await prisma.produto.findMany({
    where: { organizacaoId: parceiro.organizacaoId, ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  const orgNome = parceiro.organizacao?.nome ?? "Seahub";
  const branding = (parceiro.organizacao?.branding ?? {}) as { corPrimaria?: string };
  const cor = branding.corPrimaria || "#FF001E";

  // WhatsApp do Seahub (formato internacional, so digitos). Futuramente pode
  // vir das configuracoes da organizacao.
  const whatsapp = "5584981352287";

  return (
    <LandingForm
      parceiroId={parceiro.id}
      parceiroNome={parceiro.nome}
      orgNome={orgNome}
      cor={cor}
      whatsapp={whatsapp}
      produtos={produtos}
    />
  );
}
