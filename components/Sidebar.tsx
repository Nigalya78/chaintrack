"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShoppingCart, Hammer,
  Sparkles, DollarSign, LogOut, User, Package,
  SlidersHorizontal, Store, Truck, X,
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
    const handler = () => setIsOpen(p => !p);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSignOut = async () => {
    try { await signOut({ callbackUrl: "/login" }); }
    catch { window.location.href = "/login"; }
  };

  return (
    <>
      {/* ── Backdrop (mobile only) ── */}
      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          "lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col",
          // Mobile: full width drawer up to 280px; Desktop: fixed 256px
          "w-[280px] lg:w-64",
          "bg-[hsl(214,32%,14%)] border-r border-[hsl(214,32%,22%)]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(214,32%,22%)] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dark-logo.png"
              alt="ChainTrack"
              style={{ height: "36px", width: "auto", maxWidth: "160px" }}
              className="object-contain"
            />
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[hsl(214,15%,55%)] hover:text-white hover:bg-[hsl(214,32%,22%)] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Nav groups ── */}
        <nav className="flex-1 overflow-y-auto custom-scroll py-3 px-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[9px] font-bold uppercase tracking-widest text-[hsl(214,15%,42%)]">
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
                        // Tall touch targets on mobile
                        "flex items-center gap-3 px-3 py-3 lg:py-2 rounded-lg text-[14px] lg:text-[13px] font-medium transition-all duration-150 active:scale-[0.98]",
                        active
                          ? "bg-[#C9922A] text-white shadow-sm"
                          : "text-[hsl(214,15%,65%)] hover:text-white hover:bg-[hsl(214,32%,22%)]"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] lg:h-4 lg:w-4 shrink-0" />
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
              "flex items-center gap-3 px-3 py-3 lg:py-2 rounded-lg text-[14px] lg:text-[13px] font-medium transition-all duration-150 active:scale-[0.98]",
              pathname === "/profile"
                ? "bg-[#C9922A] text-white"
                : "text-[hsl(214,15%,65%)] hover:text-white hover:bg-[hsl(214,32%,22%)]"
            )}
          >
            <User className="h-[18px] w-[18px] lg:h-4 lg:w-4 shrink-0" />
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-3 lg:py-2 rounded-lg text-[14px] lg:text-[13px] font-medium text-[hsl(214,15%,55%)] hover:text-red-400 hover:bg-red-950/30 transition-all duration-150 active:scale-[0.98]"
          >
            <LogOut className="h-[18px] w-[18px] lg:h-4 lg:w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
