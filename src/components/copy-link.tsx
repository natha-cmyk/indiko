"use client";

import { useState } from "react";

// Caixa com um link e um botao "Copiar".
export function CopyLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // silencioso: se o navegador bloquear, o usuario ainda pode selecionar o texto
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F7F7F6", borderRadius: 12, padding: "10px 12px" }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontFamily: "ui-monospace, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {url}
      </span>
      <button
        onClick={copiar}
        type="button"
        style={{ flexShrink: 0, background: "transparent", color: "#00BBC5", border: "1px solid #00BBC5", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
      >
        {copiado ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
