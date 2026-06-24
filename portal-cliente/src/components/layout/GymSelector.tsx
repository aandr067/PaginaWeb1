import { useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronsUpDown, Globe, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocations } from "@/lib/api";
import { useFilters } from "@/state/store";

/** Selector de sede (combobox buscable). null = "Toda la cadena" (sedes del tenant). */
export function GymSelector() {
  const { location, setLocation } = useFilters();
  const { data } = useLocations();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const locations = data?.available && Array.isArray(data.data) ? data.data : [];
  const current = locations.find((l) => String(l.code) === location);
  const label = location ? (current ? String(current.name) : location) : "Toda la cadena";

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return locations;
    return locations.filter((l) =>
      `${l.name} ${l.code}`.toLowerCase().includes(needle),
    );
  }, [locations, q]);

  function pick(code: string | null) {
    setLocation(code);
    setOpen(false);
    setQ("");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-60 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm hover:bg-muted/5"
      >
        {location ? (
          <Building2 className="h-4 w-4 text-brand" />
        ) : (
          <Globe className="h-4 w-4 text-brand" />
        )}
        <span className="flex-1 truncate text-left font-medium">{label}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 mt-1 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar gimnasio…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <ul className="max-h-72 overflow-auto py-1">
              <Option
                active={location === null}
                onClick={() => pick(null)}
                icon={<Globe className="h-4 w-4" />}
                title="Toda la cadena"
                subtitle="Vista agregada de tus sedes"
              />
              {locations.length === 0 && (
                <li className="px-3 py-3 text-center text-xs text-muted">
                  Sin sedes conectadas
                </li>
              )}
              {filtered.map((l) => (
                <Option
                  key={String(l.code)}
                  active={location === String(l.code)}
                  onClick={() => pick(String(l.code))}
                  icon={<Building2 className="h-4 w-4" />}
                  title={String(l.name)}
                  subtitle={`${l.code} · ${l.contactos ?? 0} contactos`}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function Option({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/10",
          active && "bg-brand/5",
        )}
      >
        <span className="text-muted">{icon}</span>
        <span className="flex-1">
          <span className="block font-medium">{title}</span>
          <span className="block text-xs text-muted">{subtitle}</span>
        </span>
        {active && <Check className="h-4 w-4 text-brand" />}
      </button>
    </li>
  );
}
