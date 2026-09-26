import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "outline" | "ghost" | "secondary" | "gold" | "danger";
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "default",
  size = "default",
  className,
  disabled = false,
  title,
  "aria-label": ariaLabel,
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        // base
        "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius)] transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]",
        // sizes
        size === "xs"      && "h-7 px-2.5 text-xs",
        size === "sm"      && "h-8 px-3 text-sm",
        size === "default" && "h-10 px-4 text-sm",
        size === "lg"      && "h-11 px-6 text-base",
        // variants
        variant === "default" && [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/85 shadow-[var(--shadow-xs)]",
        ],
        variant === "outline" && [
          "border border-border bg-surface text-foreground",
          "hover:bg-accent hover:border-border-strong shadow-[var(--shadow-xs)]",
        ],
        variant === "ghost" && [
          "text-foreground hover:bg-accent",
        ],
        variant === "secondary" && [
          "bg-muted text-foreground",
          "hover:bg-muted/70 shadow-[var(--shadow-xs)]",
        ],
        variant === "gold" && [
          // exact brand gold #C9922A
          "bg-gradient-to-b from-[#D9A23A] to-[#C9922A] text-white font-semibold",
          "shadow-[0_1px_0_0_#9A6B18,var(--shadow-sm)]",
          "hover:from-[#E0AA42] hover:to-[#D49A30]",
          "active:from-[#BB8422] active:to-[#B07A18]",
          "border border-[#9A6B18]/20",
        ],
        variant === "danger" && [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/85 shadow-[var(--shadow-xs)]",
        ],
        className
      )}
    >
      {children}
    </button>
  );
}
