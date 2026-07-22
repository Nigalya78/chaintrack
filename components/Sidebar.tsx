"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Hammer, 
  Sparkles, 
  DollarSign,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Labour Transactions", href: "/labour-transactions", icon: Hammer },
  { name: "Finishing", href: "/finishing-transactions", icon: Sparkles },
  { name: "Sales", href: "/sales", icon: DollarSign },
  { name: "Inventory", href: "/inventory", icon: ShoppingCart },
  { name: "Labourers", href: "/labour", icon: Users },
  { name: "Vendors", href: "/vendors", icon: Users },
  { name: "Shops", href: "/shops", icon: DollarSign },
  { name: "Adjustments", href: "/adjustments", icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      console.error("Signout error:", error)
      window.location.href = "/login"
    }
  }

  return (
    <>
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-gradient-to-b from-white to-gray-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border px-6 bg-gradient-to-r from-yellow-400 to-yellow-500">
            <h1 className="text-lg font-semibold text-black">
              Chain Track
            </h1>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-md"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
}
