"use client"

import { cn } from "@/lib/utils"

type NumericInputProps = {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  step?: string
  min?: number
  max?: number
  required?: boolean
  disabled?: boolean
  className?: string
  allowDecimal?: boolean
}

/**
 * NumericInput — like <Input type="number"> but:
 * - Stores value as a string so the field can be truly empty
 * - When the current value is "0" and the user types a digit, replaces the zero
 * - On blur: if empty and not required, keeps empty; trims leading zeros
 */
export function NumericInput({
  value,
  onChange,
  placeholder = "0",
  step,
  min,
  max,
  required = false,
  disabled = false,
  className,
  allowDecimal = true,
}: Readonly<NumericInputProps>) {
  const strValue = value === undefined || value === null ? "" : String(value)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    // Select all on focus so the user can overwrite without backspacing
    e.target.select()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const digit = e.key
    // If the field currently shows exactly "0" and user presses a digit key, clear first
    if (
      strValue === "0" &&
      /^[0-9]$/.test(digit) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault()
      onChange(digit)
    }
  }

  function handleBlur() {
    if (strValue === "" || strValue === "-") return
    const num = allowDecimal ? parseFloat(strValue) : parseInt(strValue)
    if (isNaN(num)) {
      onChange("")
    } else {
      // Remove unnecessary leading zeros but preserve decimals
      onChange(String(num))
    }
  }

  return (
    <input
      type="number"
      value={strValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      required={required}
      disabled={disabled}
      className={cn(
        "w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background",
        "text-sm placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-border",
        // Hide browser spin buttons for cleaner look
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
    />
  )
}
