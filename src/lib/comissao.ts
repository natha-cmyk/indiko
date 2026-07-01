import { prisma } from "@/lib/prisma";

// Formata centavos como moeda brasileira. Ex.: 8900 -> "R$ 89,00".
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Gera a comissao de uma indicacao recem-convertida.
// Idempotente: se ja existe comissao nao-cancelada para a indicacao, nao faz nada.
export async function gerarComissaoParaIndicacao(indicacaoId: string): Promise<void> {
  const ind = await prisma.indicacao.findUnique({
    where: { id: indicacaoId },
    select: {
      id: true,
      organizacaoId: true,
      produtoId: true,
      convertidaEm: true,
      parceiro: {
        select: {
          id: true,
          programaId: true,
          nivel: { select: { multiplicador: true } },
        },
      },
      produto: { select: { valorBaseCents: true } },
    },
  });
  if (!ind) return;

  // Nao duplicar: se ja ha comissao viva (nao cancelada) para essa indicacao, sai.
  const existente = await prisma.comissao.findFirst({
    where: { indicacaoId: ind.id, status: { not: "CANCELADA" } },
    select: { id: true },
  });
  if (existente) return;

  // Regra de comissao do par (programa do parceiro + produto da indicacao).
  const regra = await prisma.comissaoRegra.findFirst({
    where: { programaId: ind.parceiro.programaId, produtoId: ind.produtoId },
    select: { tipo: true, valor: true, recorrencia: true },
  });
  if (!regra) return; // sem regra p/ esse produto nesse programa -> sem comissao

  // base: VALOR_FIXO em centavos; PERCENTUAL em base 10000 sobre o valor do produto.
  const base =
    regra.tipo === "VALOR_FIXO"
      ? regra.valor
      : Math.round((ind.produto.valorBaseCents * regra.valor) / 10000);

  // multiplicador do nivel (base 10000; 12500 = 1,25x). Sem nivel -> 1x.
  const mult = ind.parceiro.nivel?.multiplicador ?? 10000;
  const valorBrutoCents = Math.round((base * mult) / 10000);

  const ref = ind.convertidaEm ?? new Date();
  const mesReferencia = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;

  await prisma.comissao.create({
    data: {
      organizacaoId: ind.organizacaoId,
      indicacaoId: ind.id,
      parceiroId: ind.parceiro.id,
      tipo: regra.recorrencia,
      valorBrutoCents,
      valorLiquidoCents: valorBrutoCents, // sem deducoes por enquanto
      status: "PENDENTE", // "a liberar"
      mesReferencia,
    },
  });
}

// Cancela comissoes de uma indicacao que deixou de estar convertida.
// So mexe no que ainda nao foi pago.
export async function cancelarComissoesDaIndicacao(indicacaoId: string): Promise<void> {
  await prisma.comissao.updateMany({
    where: { indicacaoId, status: { in: ["PENDENTE", "DISPONIVEL"] } },
    data: { status: "CANCELADA" },
  });
}
