import type { ReactNode } from "react";
import { CheckCircle2, Circle, Clock, PauseCircle } from "lucide-react";
import { useOnboarding, type OnboardingPhase } from "@/lib/api";
import { Badge, Card } from "@/components/ui";
import { SectionShell } from "@/components/panels";

type Estado = OnboardingPhase["status"];

const META: Record<Estado, { label: string; tone: "success" | "brand" | "neutral" | "warning"; icon: ReactNode }> = {
  hecho: { label: "Completado", tone: "success", icon: <CheckCircle2 className="h-5 w-5 text-success" /> },
  activo: { label: "En curso", tone: "brand", icon: <Clock className="h-5 w-5 text-brand" /> },
  pendiente: { label: "Pendiente", tone: "neutral", icon: <Circle className="h-5 w-5 text-muted" /> },
  requiere_vbo: { label: "Requiere tu visto bueno", tone: "warning", icon: <PauseCircle className="h-5 w-5 text-warning" /> },
};

export function OnboardingSection() {
  const q = useOnboarding();
  return (
    <SectionShell
      title="Estado del proyecto"
      subtitle="Implementación por fases: qué está activo, qué viene y qué requiere tu aprobación."
      query={q}
    >
      {(data) => {
        const fases = data.phases ?? [];
        if (fases.length === 0) {
          return (
            <Card className="p-6 text-center text-sm text-muted">
              Aún no hay un plan de onboarding configurado para tu cuenta.
            </Card>
          );
        }
        const done = fases.filter((f) => f.status === "hecho").length;
        const pct = Math.round((done / fases.length) * 100);
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Progreso del onboarding</span>
                <span className="tabular-nums text-muted">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/20">
                <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
            </Card>
            <div className="space-y-2">
              {fases.map((f) => {
                const m = META[f.status];
                return (
                  <Card key={f.phase_key} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      {m.icon}
                      <span className="text-sm font-medium">{f.title}</span>
                    </div>
                    <Badge tone={m.tone}>{m.label}</Badge>
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
