"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoResetButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resetDemo() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/demo/reset", { method: "POST" });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage(result.message || "Não foi possível resetar a demo.");
        return;
      }

      setConfirmOpen(false);
      setMessage("Dados fictícios restaurados.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={() => setConfirmOpen(true)}>
          <RotateCcw className="h-4 w-4" />
          Resetar dados demo
        </Button>
        {message ? <span className="text-xs text-muted">{message}</span> : null}
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-reset-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <h2 id="demo-reset-title" className="text-xl font-semibold">
              Restaurar demonstração?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Isso vai restaurar os dados fictícios da demonstração.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="button" disabled={pending} onClick={resetDemo}>
                <RotateCcw className="h-4 w-4" />
                {pending ? "Restaurando..." : "Restaurar dados"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
