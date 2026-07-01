// Selo colorido para o status do parceiro.
const MAPA: Record<string, { rotulo: string; fundo: string; cor: string }> = {
  ATIVO: { rotulo: "Ativo", fundo: "#16A34A1A", cor: "#16A34A" },
  INATIVO: { rotulo: "Inativo", fundo: "#F59E0B1F", cor: "#F59E0B" },
  BANIDO: { rotulo: "Banido", fundo: "#FF001E14", cor: "#FF001E" },
};

export function BadgeStatus({ status }: { status: string }) {
  const s = MAPA[status] ?? { rotulo: status, fundo: "#9A9A981A", cor: "#6B6B6B" };
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 999,
        padding: "4px 12px",
        background: s.fundo,
        color: s.cor,
      }}
    >
      {s.rotulo}
    </span>
  );
}
