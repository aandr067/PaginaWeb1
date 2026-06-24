import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { apiCreateTicket, useTickets, type TicketItem } from "@/lib/api";
import { fmtDay } from "@/lib/format";
import { Badge, Card } from "@/components/ui";
import { SectionShell } from "@/components/panels";

const ESTADO: Record<string, { label: string; tone: "warning" | "brand" | "success" }> = {
  abierto: { label: "Abierto", tone: "warning" },
  en_curso: { label: "En curso", tone: "brand" },
  resuelto: { label: "Resuelto", tone: "success" },
};

export function SoporteSection() {
  const q = useTickets();
  const qc = useQueryClient();
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");

  const create = useMutation({
    mutationFn: () => apiCreateTicket(asunto.trim(), cuerpo.trim()),
    onSuccess: async () => {
      setAsunto("");
      setCuerpo("");
      await qc.invalidateQueries({ queryKey: ["portal/tickets"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (asunto.trim()) create.mutate();
  }

  return (
    <SectionShell
      title="Soporte"
      subtitle="Punto único para incidencias o peticiones. Cada envío crea un ticket."
      query={q}
    >
      {(data) => {
        const tickets: TicketItem[] = data.tickets ?? [];
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <form onSubmit={onSubmit} className="space-y-3">
                <input
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Asunto"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <textarea
                  value={cuerpo}
                  onChange={(e) => setCuerpo(e.target.value)}
                  placeholder="Describe tu incidencia o petición…"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
                />
                {create.isError && (
                  <p className="text-sm text-danger">No se pudo crear el ticket. Inténtalo de nuevo.</p>
                )}
                <button
                  type="submit"
                  disabled={create.isPending || !asunto.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {create.isPending ? "Enviando…" : "Crear ticket"}
                </button>
              </form>
            </Card>
            <div className="space-y-2">
              {tickets.length === 0 && (
                <Card className="p-6 text-center text-sm text-muted">
                  No tienes solicitudes todavía.
                </Card>
              )}
              {tickets.map((t) => {
                const s = ESTADO[t.status] ?? { label: t.status, tone: "warning" as const };
                return (
                  <Card key={t.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-muted">{t.created_at ? fmtDay(t.created_at) : "—"}</p>
                    </div>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      }}
    </SectionShell>
  );
}
