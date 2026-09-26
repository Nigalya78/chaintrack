import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  noPadding?: boolean;
};

export function Card({ title, subtitle, children, className, action, noPadding }: Readonly<CardProps>) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-[hsl(var(--surface))]",
        "shadow-[var(--shadow-sm)] overflow-hidden",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/60">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-foreground leading-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-5")}>{children}</div>
    </section>
  );
}

/* ── Lightweight stat card ────────────────────────────────── */
type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accent?: string; // tailwind bg class for icon bg
  className?: string;
};

export function StatCard({ label, value, sub, icon, accent = "bg-muted", className }: Readonly<StatCardProps>) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-[hsl(var(--surface))]",
        "shadow-[var(--shadow-sm)] p-4 flex items-start justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground mt-1 leading-none">{value}</p>
        {sub && <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1.5">{sub}</p>}
      </div>
      {icon && (
        <div className={cn("shrink-0 p-2.5 rounded-[var(--radius)] mt-0.5", accent)}>
          {icon}
        </div>
      )}
    </section>
  );
}
