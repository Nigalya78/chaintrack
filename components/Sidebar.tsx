"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShoppingCart, Hammer,
  Sparkles, DollarSign, LogOut, User, Package,
  SlidersHorizontal, Store, Truck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

const NAV_GROUPS = [
  {
    label: "Operations",
    items: [
      { name: "Dashboard",             href: "/dashboard",             icon: LayoutDashboard },
      { name: "Purchases",             href: "/purchases",             icon: ShoppingCart },
      { name: "Labour",                href: "/labour-transactions",   icon: Hammer },
      { name: "Finishing",             href: "/finishing-transactions",icon: Sparkles },
      { name: "Sales",                 href: "/sales",                 icon: DollarSign },
    ],
  },
  {
    label: "Stock",
    items: [
      { name: "Inventory",             href: "/inventory",             icon: Package },
      { name: "Adjustments",           href: "/adjustments",           icon: SlidersHorizontal },
    ],
  },
  {
    label: "Directory",
    items: [
      { name: "Labourers",             href: "/labour",                icon: Users },
      { name: "Vendors",               href: "/vendors",               icon: Truck },
      { name: "Shops",                 href: "/shops",                 icon: Store },
      { name: "Suppliers",             href: "/suppliers",             icon: ShoppingCart },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  // Close on route change (mobile)
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    try { await signOut({ callbackUrl: "/login" }); }
    catch { window.location.href = "/login"; }
  };

  return (
    <>
      {/* ── Backdrop (mobile only) ──────────────────── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 transition-opacity"
          aria-hidden
        />
      )}

      {/* ── Sidebar panel ──────────────────────────── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 flex flex-col",
          "bg-[hsl(var(--surface))] border-r border-border",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0 shadow-[var(--shadow-xl)]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center h-16 px-5 border-b border-border shrink-0 bg-gradient-to-r from-[hsl(43,95%,46%)] to-[hsl(43,95%,54%)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-black/15 flex items-center justify-center">
              <span className="text-black font-black text-sm leading-none">C</span>
            </div>
            <span className="font-bold text-[15px] text-black tracking-tight">ChainTrack</span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto custom-scroll py-3 px-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--foreground-muted))]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ name, href, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-gradient-to-r from-[hsl(43,95%,50%)] to-[hsl(43,95%,56%)] text-black shadow-[var(--shadow-xs)]"
                          : "text-[hsl(var(--foreground-muted))] hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-black" : "")} />
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-3 space-y-0.5">
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-all duration-150",
              pathname === "/profile"
                ? "bg-gradient-to-r from-[hsl(43,95%,50%)] to-[hsl(43,95%,56%)] text-black shadow-[var(--shadow-xs)]"
                : "text-[hsl(var(--foreground-muted))] hover:text-foreground hover:bg-accent"
            )}
          >
            <User className="h-4 w-4 shrink-0" />
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[var(--radius)] text-sm font-medium text-[hsl(var(--foreground-muted))] hover:text-destructive hover:bg-red-50 transition-all duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
