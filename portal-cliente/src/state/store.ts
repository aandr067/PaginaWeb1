import { create } from "zustand";
import { isoDaysAgo, todayIso } from "@/lib/format";

/** Estado de filtros compartido por TODAS las secciones (regla §3: tenant key). */
interface FilterState {
  /** Código del gimnasio seleccionado. `null` = "Todos los gimnasios" (agregado). */
  location: string | null;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  setLocation: (code: string | null) => void;
  setRange: (from: string, to: string) => void;
}

export const useFilters = create<FilterState>((set) => ({
  location: null,
  from: isoDaysAgo(30),
  to: todayIso(),
  setLocation: (location) => set({ location }),
  setRange: (from, to) => set({ from, to }),
}));
