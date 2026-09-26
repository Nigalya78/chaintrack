"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({ open, onClose, title, description, children, className }: Readonly<DialogProps>) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        className={cn(
          "relative z-50 w-full sm:max-w-lg",
          "bg-white border border-border",
          "rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)]",
          "shadow-[var(--shadow-xl)] overflow-hidden",
          className
        )}
      >
        {/* Header — navy */}
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3.5 bg-[hsl(214,32%,17%)]">
          <div>
            <h2 className="text-[15px] font-semibold text-white">{title}</h2>
            {description && (
              <p className="text-[12px] text-[hsl(214,15%,60%)] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-[var(--radius-sm)] text-[hsl(214,15%,55%)] hover:text-white hover:bg-[hsl(214,32%,25%)] transition-colors mt-0.5"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
