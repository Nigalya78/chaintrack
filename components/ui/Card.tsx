import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function Card({ title, children, className, action }: Readonly<CardProps>) {
  return (
    <section className={cn("rounded-xl border border-border/50 bg-card text-card-foreground shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border/50">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5 pt-3 overflow-x-auto">{children}</div>
    </section>
  );
}
