/**
 * Shared styling constants for all form elements.
 * Brand: Gold #C9922A, Navy #1E2A3A
 */

export const S = {
  select:
    "w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-border bg-white text-sm text-foreground outline-none transition-all duration-150 hover:border-[#C9922A]/50 focus:border-[#C9922A] focus:ring-2 focus:ring-[#C9922A]/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9922A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.85rem_center] pr-9",

  date:
    "w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-border bg-white text-sm text-foreground outline-none transition-all duration-150 hover:border-[#C9922A]/50 focus:border-[#C9922A] focus:ring-2 focus:ring-[#C9922A]/20",

  infoBanner:
    "rounded-[var(--radius)] bg-[hsl(38,66%,96%)] border border-[#C9922A]/30 px-4 py-3 text-sm text-[hsl(214,32%,25%)]",

  iconBtn:
    "p-1.5 rounded-[var(--radius-sm)] text-[hsl(214,18%,55%)] hover:text-[hsl(214,32%,17%)] hover:bg-[hsl(38,66%,94%)] transition-colors duration-100",

  iconBtnDanger:
    "p-1.5 rounded-[var(--radius-sm)] text-[hsl(214,18%,55%)] hover:text-destructive hover:bg-red-50 transition-colors duration-100",
}
