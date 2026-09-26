/**
 * Shared styling constants for form elements across all pages.
 * Use these instead of inline className strings for consistency.
 */

export const S = {
  /** Styled select with custom arrow */
  select:
    "w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-border bg-[hsl(var(--surface))] text-sm text-foreground outline-none transition-all duration-150 hover:border-[hsl(var(--border-strong))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)] disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.85rem_center] pr-9",

  /** Date input — same as input base */
  date:
    "w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-border bg-[hsl(var(--surface))] text-sm text-foreground outline-none transition-all duration-150 hover:border-[hsl(var(--border-strong))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)]",

  /** Gold info/preview banner */
  infoBanner:
    "rounded-[var(--radius)] bg-[hsl(43,95%,96%)] border border-[hsl(43,80%,80%)] px-4 py-3 text-sm text-[hsl(43,50%,30%)]",

  /** Inline action icon button — neutral */
  iconBtn:
    "p-1.5 rounded-[var(--radius-sm)] text-[hsl(var(--foreground-muted))] hover:text-foreground hover:bg-[hsl(var(--muted))] transition-colors duration-100",

  /** Inline action icon button — danger */
  iconBtnDanger:
    "p-1.5 rounded-[var(--radius-sm)] text-[hsl(var(--foreground-muted))] hover:text-destructive hover:bg-red-50 transition-colors duration-100",
}
