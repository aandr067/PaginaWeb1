/** Formateo (es-ES) y utilidades de export. */

const INT = new Intl.NumberFormat("es-ES");
const MONEY = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function fmtInt(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? INT.format(n) : "—";
}

export function fmtNum(value: unknown, digits = 1): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("es-ES", { maximumFractionDigits: digits }) : "—";
}

export function fmtMoney(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? MONEY.format(n) : "—";
}

export function fmtPct(value: unknown, digits = 1): string {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString("es-ES", { maximumFractionDigits: digits })} %` : "—";
}

export function fmtDate(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDay(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

/** Representación compacta de un valor de celda (incl. JSON anidado). */
export function cellText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "object") {
    const s = JSON.stringify(value);
    return s.length > 80 ? `${s.slice(0, 80)}…` : s;
  }
  return String(value);
}

export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Descarga `rows` como CSV (UTF-8 con BOM para Excel). */
export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(";")).join("\n");
  const csv = `﻿${cols.join(";")}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
