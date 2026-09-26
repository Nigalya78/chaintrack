"use client";

import { cn } from "@/lib/utils";
import { inputBase } from "./Input";

type NumericInputProps = {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowDecimal?: boolean;
};

export function NumericInput({ value, onChange, placeholder = "0", step, min, max,
  required = false, disabled = false, className, allowDecimal = true }: Readonly<NumericInputProps>) {
  const strValue = value === undefined || value === null ? "" : String(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) { onChange(e.target.value); }
  function handleFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.select(); }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (strValue === "0" && /^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); onChange(e.key);
    }
  }
  function handleBlur() {
    if (strValue === "" || strValue === "-") return;
    const num = allowDecimal ? parseFloat(strValue) : parseInt(strValue);
    if (isNaN(num)) onChange(""); else onChange(String(num));
  }

  return (
    <input
      type="number" value={strValue} onChange={handleChange} onFocus={handleFocus}
      onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder={placeholder}
      step={step} min={min} max={max} required={required} disabled={disabled}
      className={cn(
        inputBase,
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
    />
  );
}
