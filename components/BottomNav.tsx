"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingCart, Hammer,
  Sparkles, DollarSign, Package, Users,
  Truck, Store, SlidersHorizontal,
} from "lucide-react";

const NAV = [
  { name: "Home",      href: "/dashboard",              icon: LayoutDashboard },
  { name: "Purchases", href: "/purchases",              icon: ShoppingCart },
  { name: "Labour",    href: "/labour-transactions",    icon: Hammer },
  { name: "Finishing", href: "/finishing-transactions", icon: Sparkles },
  { name: "Sales",     href: "/sales",                  icon: DollarSign },
  { name: "Inventory", href: "/inventory",              icon: Package },
  { name: "Labourers", href: "/labour",                 icon: Users },
  { name: "Vendors",   href: "/vendors",                icon: Truck },
  { name: "Shops",     href: "/shops",                  icon: Store },
  { name: "Adjust",    href: "/adjustments",            icon: SlidersHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50">
      {/* Frosted glass bar */}
      <div className="bg-[hsl(var(--surface)/0.96)] backdrop-blur-md border-t border-border shadow-[0_-1px_0_0_hsl(var(--border))]">
        <div
          className="flex items-stretch h-[60px] overflow-x-auto scrollbar-hide px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {NAV.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[58px] px-1 shrink-0 rounded-[var(--radius)] mx-0.5 my-1.5 transition-all duration-150",
                  active
                    ? "bg-[hsl(43,95%,50%)] text-black"
                    : "text-[hsl(var(--foreground-muted))] hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="text-[10px] font-semibold leading-none">{name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
