"use client";

import { useState } from "react";

type ShareResultCardProps = {
  shareText: string;
};

export function ShareResultCard({ shareText }: ShareResultCardProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(`${shareText} | ${currentUrl}`);
      setStatus("Resultado copiado.");
    } catch {
      setStatus("No se pudo copiar en este navegador.");
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Compartir resultado</h2>
      <p className="mt-2 text-sm text-slate-700">{shareText}</p>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Copiar resumen
      </button>
      {status ? <p className="mt-2 text-sm text-slate-600">{status}</p> : null}
    </section>
  );
}
