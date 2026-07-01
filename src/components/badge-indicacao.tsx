// Selo colorido para o status de uma indicação (funil).
export const STATUS_INDICACAO: Record<string, string> = {
  AGUARDANDO_CONTATO: "Aguardando contato",
  EM_NEGOCIACAO: "Em negociação",
  CONVERTIDA: "Convertida",
  PERDIDA: "Perdida",
  DESCARTADA: "Descartada",
};

const CORES: Record<string, { fundo: string; cor: string }> = {
  AGUARDANDO_CONTATO: { fundo: "#00BBC514", cor: "#00BBC5" },
  EM_NEGOCIACAO: { fundo: "#F59E0B1F", cor: "#F59E0B" },
  CONVERTIDA: { fundo: "#16A34A1A", cor: "#16A34A" },
  PERDIDA: { fundo: "#9A9A981A", cor: "#6B6B6B" },
  DESCARTADA: { fundo: "#FF001E14", cor: "#FF001E" },
};

export function BadgeIndicacao({ status }: { status: string }) {
  const c = CORES[status] ?? { fundo: "#9A9A981A", cor: "#6B6B6B" };
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 999,
        padding: "4px 12px",
        background: c.fundo,
        color: c.cor,
      }}
    >
      {STATUS_INDICACAO[status] ?? status}
    </span>
  );
}
