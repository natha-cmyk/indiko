"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Programa = { id: string; nome: string };

// Seletor de programa reutilizavel. Atualiza o parametro ?programa= na URL
// preservando os outros filtros (status, busca). Usado em varios paineis.
export function FiltroPrograma({ programas }: { programas: Programa[] }) {
  return (
    <Suspense fallback={null}>
      <Seletor programas={programas} />
    </Suspense>
  );
}

function Seletor({ programas }: { programas: Programa[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const atual = params.get("programa") ?? "";

  function mudar(valor: string) {
    const p = new URLSearchParams(params.toString());
    if (valor) p.set("programa", valor);
    else p.delete("programa");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={atual}
      onChange={(e) => mudar(e.target.value)}
      style={{
        fontSize: 13,
        fontWeight: 600,
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #E6E6E4",
        background: "#fff",
        color: "#121111",
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      <option value="">Todos os programas</option>
      {programas.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nome}
        </option>
      ))}
    </select>
  );
}
