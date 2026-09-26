import { cn } from "@/lib/utils";

type InputProps = {
  type?: "text" | "email" | "tel" | "password" | "number" | "date" | "url";
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  step?: string;
  min?: number | string;
  max?: number | string;
  name?: string;
  id?: string;
  autoComplete?: string;
  className?: string;
  readOnly?: boolean;
};

const inputBase = [
  "w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-border bg-[hsl(var(--surface))]",
  "text-sm text-foreground placeholder:text-[hsl(var(--foreground-muted))]",
  "outline-none transition-all duration-150",
  "hover:border-[hsl(var(--border-strong))]",
  "focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)]",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
  "read-only:bg-muted read-only:cursor-default",
].join(" ");

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
  id,
  autoComplete,
  className,
  readOnly,
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
      id={id}
      autoComplete={autoComplete}
      readOnly={readOnly}
      className={cn(inputBase, className)}
    />
  );
}

export { inputBase };
