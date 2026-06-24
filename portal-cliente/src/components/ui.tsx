import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface shadow-card", className)}>
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand",
        className,
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
const TONES: Record<Tone, string> = {
  neutral: "bg-muted/10 text-muted",
  brand: "bg-brand/10 text-brand",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  onClick,
  variant = "ghost",
  className,
  children,
  title,
}: {
  onClick?: () => void;
  variant?: "ghost" | "outline" | "brand";
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  const styles = {
    ghost: "hover:bg-muted/10 text-muted hover:text-fg",
    outline: "border border-border hover:bg-muted/10 text-fg",
    brand: "bg-brand text-brand-fg hover:opacity-90",
  }[variant];
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
        styles,
        className,
      )}
    >
      {children}
    </button>
  );
}
