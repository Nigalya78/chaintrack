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
  children, onClick, type = "button", variant = "default",
  size = "default", className, disabled = false, title, "aria-label": ariaLabel,
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled} title={title} aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97]",
        // Sizes — ensure minimum 44px touch target on mobile for default/lg
        size === "xs"      && "h-7 px-2.5 text-xs",
        size === "sm"      && "h-8 px-3 text-sm",
        size === "default" && "h-10 min-h-[44px] px-4 text-sm",
        size === "lg"      && "h-11 min-h-[44px] px-6 text-base",
        // Variants
        variant === "default" && "bg-[hsl(214,32%,17%)] text-white hover:bg-[hsl(214,32%,24%)] shadow-sm",
        variant === "outline" && "border border-border bg-white text-foreground hover:bg-[hsl(38,66%,96%)] shadow-sm",
        variant === "ghost"   && "text-foreground hover:bg-[hsl(38,66%,96%)]",
        variant === "secondary" && "bg-muted text-foreground hover:bg-muted/70 shadow-sm",
        variant === "gold" && [
          "bg-gradient-to-b from-[#D9A23A] to-[#C9922A] text-white font-semibold",
          "shadow-[0_1px_0_0_#9A6B18,0_2px_4px_0_rgb(0,0,0,0.12)]",
          "hover:from-[#E0AA42] hover:to-[#D49A30]",
          "active:from-[#BB8422] active:to-[#B07A18]",
        ],
        variant === "danger" && "bg-destructive text-white hover:bg-destructive/85 shadow-sm",
        className
      )}
    >
      {children}
    </button>
  );
}
