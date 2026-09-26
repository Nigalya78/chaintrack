import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
};

export function FormField({
  label,
  hint,
  error,
  children,
  className,
  required,
}: Readonly<FormFieldProps>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-foreground leading-none">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--foreground-muted))]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

/* ── Section divider ──────────────────────────────────────── */
export function FormSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] pb-1 border-b border-border/50">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/* ── Info banner (gold preview strip) ─────────────────────── */
export function InfoBanner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius)] px-4 py-3",
        "bg-[hsl(43,95%,96%)] border border-[hsl(43,80%,80%)]",
        "text-sm text-[hsl(43,60%,30%)]",
        className
      )}
    >
      {children}
    </div>
  );
}
