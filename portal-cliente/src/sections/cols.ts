import type { Column } from "@/components/panels";
import { fmtDate, fmtInt, fmtMoney } from "@/lib/format";

/** Fábricas de columnas reutilizables para las tablas de detalle. */
export const col = (key: string, label: string): Column => ({ key, label });
export const dateCol = (key: string, label: string): Column => ({
  key,
  label,
  fmt: (v) => fmtDate(v),
});
export const numCol = (key: string, label: string): Column => ({
  key,
  label,
  align: "right",
  fmt: (v) => fmtInt(v),
});
export const moneyCol = (key: string, label: string): Column => ({
  key,
  label,
  align: "right",
  fmt: (v) => fmtMoney(v),
});
