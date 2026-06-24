import type { ReactNode } from "react";
import { Download, Inbox } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { cellText, downloadCsv } from "@/lib/format";
import type { Envelope, Row } from "@/lib/api";
import { Button, Card, Spinner } from "@/components/ui";

export function EmptyState({
  compact,
  title,
  hint,
}: {
  compact?: boolean;
  title?: string;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-center text-muted",
        compact ? "py-10" : "py-14",
      )}
    >
      <Inbox className="mb-1 h-6 w-6 opacity-60" />
      <p className="text-sm font-medium">{title ?? "Sin datos / no conectado"}</p>
      {hint && <p className="max-w-xs text-xs opacity-80">{hint}</p>}
    </div>
  );
}

/** Maneja loading / no-autorizado / no-disponible de una sección entera. */
export function SectionShell<T>({
  title,
  subtitle,
  query,
  children,
}: {
  title: string;
  subtitle?: string;
  query: UseQueryResult<Envelope<T>>;
  children: (data: T) => ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </header>
      <Boundary query={query}>{children}</Boundary>
    </section>
  );
}

function Boundary<T>({
  query,
  children,
}: {
  query: UseQueryResult<Envelope<T>>;
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }
  if (query.isError) {
    const unauth = query.error instanceof Error && query.error.message === "unauthorized";
    return (
      <Card className="p-4">
        <EmptyState
          title={unauth ? "No autorizado" : "Error al cargar"}
          hint={
            unauth
              ? "Define un token de acceso válido para la API de analítica."
              : "Reintenta más tarde."
          }
        />
      </Card>
    );
  }
  const env = query.data;
  if (!env || !env.available || env.data == null) {
    return (
      <Card className="p-4">
        <EmptyState
          title="Sin datos / no conectado"
          hint="La fuente no está conectada o no devolvió datos para este filtro."
        />
      </Card>
    );
  }
  return <>{children(env.data)}</>;
}

type Tone = "brand" | "success" | "warning" | "danger" | "info" | "neutral";
const KPI_TONE: Record<Tone, string> = {
  brand: "text-brand",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-fg",
};

export function KpiCard({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {icon && <span className={cn("opacity-70", KPI_TONE[tone])}>{icon}</span>}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tabular-nums", KPI_TONE[tone])}>{value}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {children}
    </div>
  );
}

export function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-bg px-3 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  csv,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  csv?: { name: string; rows: Row[] };
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {csv && csv.rows.length > 0 && (
          <Button title="Exportar CSV" onClick={() => downloadCsv(csv.name, csv.rows)}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      {children}
    </Card>
  );
}

export interface Column {
  key: string;
  label: string;
  fmt?: (value: unknown, row: Row) => ReactNode;
  align?: "left" | "right";
}

export function DataTable({
  title,
  columns,
  rows: data,
  name,
  subtitle,
}: {
  title: string;
  columns: Column[];
  rows: Row[];
  name: string;
  subtitle?: string;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted">
            {subtitle ?? `${data.length} fila${data.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {data.length > 0 && (
          <Button title="Exportar CSV" onClick={() => downloadCsv(name, data)}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      {data.length === 0 ? (
        <EmptyState compact />
      ) : (
        <div className="max-h-[440px] overflow-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-bg">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      "border-b border-border px-3 py-2 text-left font-medium text-muted",
                      c.align === "right" && "text-right",
                    )}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-muted/5">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "border-b border-border/60 px-3 py-1.5 tabular-nums",
                        c.align === "right" && "text-right",
                      )}
                    >
                      {c.fmt ? c.fmt(r[c.key], r) : cellText(r[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/** Cuadrícula responsiva de 2 columnas para gráficos. */
export function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>;
}
