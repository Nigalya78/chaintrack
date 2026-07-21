import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "outline" | "ghost" | "secondary" | "gold";
  size?: "default" | "sm" | "lg";
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
  "aria-label": ariaLabel
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        size === "lg" && "h-11 px-8",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        variant === "outline" && "border border-border/50 bg-background hover:bg-accent hover:border-border shadow-sm",
        variant === "ghost" && "hover:bg-accent",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        variant === "gold" && "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 shadow-md hover:shadow-lg",
        className
      )}
    >
      {children}
    </button>
  );
}
