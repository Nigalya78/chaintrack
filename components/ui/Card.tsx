import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: Readonly<CardProps>) {
  return (
    <section className={cn("rounded-xl border border-border/50 bg-card text-card-foreground shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden", className)}>
      {title ? <h2 className="text-lg font-semibold p-5 pb-3 text-primary border-b border-border/50">{title}</h2> : null}
      <div className="p-5 pt-3 overflow-x-auto">{children}</div>
    </section>
  );
}
