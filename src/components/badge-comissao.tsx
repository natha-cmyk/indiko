// Selo colorido para o status de uma comissao.
export const STATUS_COMISSAO: Record<string, string> = {
  PENDENTE: "A liberar",
  DISPONIVEL: "Disponível",
  PAGA: "Paga",
  CANCELADA: "Cancelada",
};

const CORES: Record<string, { fundo: string; cor: string }> = {
  PENDENTE: { fundo: "#F59E0B1F", cor: "#F59E0B" },
  DISPONIVEL: { fundo: "#00BBC514", cor: "#00BBC5" },
  PAGA: { fundo: "#16A34A1A", cor: "#16A34A" },
  CANCELADA: { fundo: "#9A9A981A", cor: "#6B6B6B" },
};

export function BadgeComissao({ status }: { status: string }) {
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
      {STATUS_COMISSAO[status] ?? status}
    </span>
  );
}
