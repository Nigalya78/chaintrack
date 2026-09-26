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
      { name: "Dashboard",   href: "/dashboard",              icon: LayoutDashboard },
      { name: "Purchases",   href: "/purchases",              icon: ShoppingCart },
      { name: "Labour",      href: "/labour-transactions",    icon: Hammer },
      { name: "Finishing",   href: "/finishing-transactions", icon: Sparkles },
      { name: "Sales",       href: "/sales",                  icon: DollarSign },
    ],
  },
  {
    label: "Stock",
    items: [
      { name: "Inventory",   href: "/inventory",   icon: Package },
      { name: "Adjustments", href: "/adjustments", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Directory",
    items: [
      { name: "Labourers",   href: "/labour",     icon: Users },
      { name: "Vendors",     href: "/vendors",    icon: Truck },
      { name: "Shops",       href: "/shops",      icon: Store },
      { name: "Suppliers",   href: "/suppliers",  icon: ShoppingCart },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen((p) => !p);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    try { await signOut({ callbackUrl: "/login" }); }
    catch { window.location.href = "/login"; }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30"
          aria-hidden
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 flex flex-col",
          // Brand navy background
          "bg-[hsl(214,32%,14%)] border-r border-[hsl(214,32%,22%)]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0 shadow-[var(--shadow-xl)]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ── Logo area ── */}
        <div className="flex items-center justify-center h-[70px] border-b border-[hsl(214,32%,22%)] shrink-0">
          <Link href="/dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dark-logo.png" alt="ChainTrack" width={200} height={52} className="object-contain" />
          </Link>
        </div>

        {/* ── Nav groups ── */}
        <nav className="flex-1 overflow-y-auto custom-scroll py-4 px-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-[hsl(214,15%,48%)]">
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
                        "flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-[13px] font-medium transition-all duration-150",
                        active
                          ? "bg-[#C9922A] text-white shadow-[0_1px_3px_0_rgb(201,146,42,0.4)]"
                          : "text-[hsl(214,15%,65%)] hover:text-white hover:bg-[hsl(214,32%,22%)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-[hsl(214,32%,22%)] p-3 space-y-0.5">
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-[13px] font-medium transition-all duration-150",
              pathname === "/profile"
                ? "bg-[#C9922A] text-white"
                : "text-[hsl(214,15%,65%)] hover:text-white hover:bg-[hsl(214,32%,22%)]"
            )}
          >
            <User className="h-4 w-4 shrink-0" />
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[var(--radius)] text-[13px] font-medium text-[hsl(214,15%,55%)] hover:text-red-400 hover:bg-red-950/30 transition-all duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
