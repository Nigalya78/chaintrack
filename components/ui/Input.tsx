import { cn } from "@/lib/utils";

type InputProps = {
  type?: "text" | "email" | "tel" | "password" | "number";
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  step?: string;
  min?: number;
  max?: number;
  name?: string;
  className?: string;
};

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  step,
  min,
  max,
  name,
  className,
}: Readonly<InputProps>) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      step={step}
      min={min}
      max={max}
      name={name}
      className={cn(
        "w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background",
        "text-sm placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-border",
        className
      )}
    />
  );
}
