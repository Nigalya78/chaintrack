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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />

      {/* Panel — bottom sheet on mobile, centered modal on sm+ */}
      <div
        role="dialog"
        aria-modal
        className={cn(
          "relative z-50 w-full sm:max-w-lg",
          "bg-white border border-border",
          "rounded-t-2xl sm:rounded-xl",
          "shadow-[var(--shadow-xl)] overflow-hidden",
          // max height so content doesn't overflow viewport on small screens
          "max-h-[90dvh] flex flex-col",
          className
        )}
      >
        {/* Header — navy */}
        <div className="flex items-start justify-between gap-4 px-4 sm:px-5 pt-4 pb-3 bg-[hsl(214,32%,17%)] shrink-0">
          <div>
            <h2 className="text-[14px] sm:text-[15px] font-semibold text-white">{title}</h2>
            {description && (
              <p className="text-[11px] text-[hsl(214,15%,60%)] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded text-[hsl(214,15%,55%)] hover:text-white hover:bg-[hsl(214,32%,25%)] transition-colors mt-0.5"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drag handle indicator for mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-0 shrink-0">
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>

        {/* Scrollable body */}
        <div className="px-4 sm:px-5 py-4 sm:py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
