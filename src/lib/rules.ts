// Indiko — regras de negócio (fonte única, usada por frontend e backend)
// Dinheiro sempre em CENTAVOS. Percentual em base 10000 (10000 = 100%).
//
// Os DEFAULTS abaixo são placeholders das 4 decisões pendentes.
// Em produção, leia os valores do Program no banco — use os defaults só como fallback.

export const DEFAULTS = {
  attributionWindowDays: 30,          // DECISÃO 1 — janela de atribuição
  attributionModel: "FIRST_TOUCH",    // DECISÃO 1 — first_touch | last_touch
  liberationDays: 15,                 // DECISÃO 4 — garantia antes de liberar
  minWithdrawalCents: 5000,           // DECISÃO 4 — resgate mínimo (R$50)
} as const;

// DECISÃO 2 — valores de comissão por produto (ALINHAR COM A MARGEM REAL)
// FIXO = centavos | PERCENTUAL = base 10000
export const COMMISSION_RULES = {
  ENDERECO_FISCAL: { rewardType: "FIXO", value: 8900 },        // R$89
  SALA_PRIVATIVA:  { rewardType: "PERCENTUAL", value: 1000 },  // 10%
  AUDITORIO:       { rewardType: "FIXO", value: 5000 },        // R$50
  SEABOX:          { rewardType: "FIXO", value: 1200 },        // R$12
} as const;

export const LEVEL_BONUS = {
  BRONZE: 0,
  PRATA: 0,
  OURO: 500, // +5% (base 10000) sobre a comissão
} as const;

export const LEVEL_THRESHOLDS = { PRATA: 6, OURO: 16 }; // nº de conversões

// Calcula a comissão (em centavos) de uma indicação.
export function computeCommissionCents(
  product: keyof typeof COMMISSION_RULES,
  level: keyof typeof LEVEL_BONUS,
  contractCents?: number
): number {
  const rule = COMMISSION_RULES[product];
  if (!rule) return 0;
  let base =
    rule.rewardType === "FIXO"
      ? rule.value
      : Math.round(((contractCents ?? 0) * rule.value) / 10000);
  const bonus = Math.round((base * LEVEL_BONUS[level]) / 10000);
  return base + bonus;
}

// Data em que a comissão sai de "a liberar" para "disponível".
export function liberationDate(convertedAt: Date, liberationDays = DEFAULTS.liberationDays): Date {
  const d = new Date(convertedAt);
  d.setDate(d.getDate() + liberationDays);
  return d;
}

// Resolve a quem pertence o lead dada uma lista de cliques dentro da janela.
export function resolveAttribution(
  clicks: { partnerId: string; clickedAt: Date }[],
  windowDays = DEFAULTS.attributionWindowDays,
  model: "FIRST_TOUCH" | "LAST_TOUCH" = DEFAULTS.attributionModel
): string | null {
  const now = Date.now();
  const valid = clicks
    .filter((c) => (now - c.clickedAt.getTime()) / 86400000 <= windowDays)
    .sort((a, b) => a.clickedAt.getTime() - b.clickedAt.getTime());
  if (valid.length === 0) return null;
  return model === "FIRST_TOUCH" ? valid[0].partnerId : valid[valid.length - 1].partnerId;
}

// Saldo disponível do parceiro (centavos).
export function availableBalanceCents(
  commissions: { amountCents: number; status: string }[],
  withdrawals: { amountCents: number; status: string }[]
): number {
  const disponivel = commissions
    .filter((c) => c.status === "DISPONIVEL")
    .reduce((s, c) => s + c.amountCents, 0);
  const sacado = withdrawals
    .filter((w) => w.status === "APROVADO" || w.status === "PAGO" || w.status === "EM_ANALISE")
    .reduce((s, w) => s + w.amountCents, 0);
  return disponivel - sacado;
}

// Pode solicitar resgate?
export function canWithdraw(
  amountCents: number,
  balanceCents: number,
  minCents = DEFAULTS.minWithdrawalCents
): { ok: boolean; reason?: string } {
  if (amountCents < minCents) return { ok: false, reason: `Resgate mínimo de ${minCents / 100} reais` };
  if (amountCents > balanceCents) return { ok: false, reason: "Saldo insuficiente" };
  return { ok: true };
}

export function levelFor(conversions: number): keyof typeof LEVEL_BONUS {
  if (conversions >= LEVEL_THRESHOLDS.OURO) return "OURO";
  if (conversions >= LEVEL_THRESHOLDS.PRATA) return "PRATA";
  return "BRONZE";
}
