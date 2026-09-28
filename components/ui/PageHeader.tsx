import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: Readonly<PageHeaderProps>) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 mb-4">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[hsl(var(--foreground-muted))] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
