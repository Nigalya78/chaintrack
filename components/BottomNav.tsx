"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingCart, Hammer, Sparkles,
  DollarSign, Package, Users, Truck, Store, SlidersHorizontal,
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
      <div className="bg-[hsl(214,32%,14%)] border-t border-[hsl(214,32%,22%)] shadow-[0_-2px_8px_0_rgb(0,0,0,0.2)] safe-bottom">
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
                    ? "bg-[#C9922A] text-white"
                    : "text-[hsl(214,15%,55%)] hover:text-white hover:bg-[hsl(214,32%,22%)]"
                )}
              >
                <Icon className="h-[17px] w-[17px]" />
                <span className="text-[9.5px] font-semibold leading-none">{name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
