import { CalendarRange } from "lucide-react";
import { useFilters } from "@/state/store";

/** Filtro de rango de fechas transversal (aplica a todas las secciones). */
export function DateRange() {
  const { from, to, setRange } = useFilters();
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">
      <CalendarRange className="h-4 w-4 text-muted" />
      <input
        type="date"
        value={from}
        max={to}
        onChange={(e) => setRange(e.target.value, to)}
        className="bg-transparent outline-none"
        aria-label="Desde"
      />
      <span className="text-muted">→</span>
      <input
        type="date"
        value={to}
        min={from}
        onChange={(e) => setRange(from, e.target.value)}
        className="bg-transparent outline-none"
        aria-label="Hasta"
      />
    </div>
  );
}
