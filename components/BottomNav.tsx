"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Hammer,
  Sparkles
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: ShoppingCart },
  { name: "Labourers", href: "/labour", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: ShoppingCart },
  { name: "Shops", href: "/shops", icon: DollarSign },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Labour Tx", href: "/labour-transactions", icon: Hammer },
  { name: "Finishing", href: "/finishing-transactions", icon: Sparkles },
  { name: "Sales", href: "/sales", icon: DollarSign },
  { name: "Adjustments", href: "/adjustments", icon: LayoutDashboard },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center h-16 px-2 overflow-x-auto scrollbar-hide">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[72px] h-full py-2 rounded-lg transition-all duration-200 flex-shrink-0",
                isActive
                  ? "text-yellow-600 bg-yellow-50"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
