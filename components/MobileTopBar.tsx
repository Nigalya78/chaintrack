"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { User, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export function MobileTopBar() {
  const { data: session } = useSession();
  const [businessName, setBusinessName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const cached = localStorage.getItem("businessName");
    if (cached) setBusinessName(cached);
    if (session?.user && !cached) fetchBusinessName();
  }, [session]);

  async function fetchBusinessName() {
    try {
      const res = await fetch("/api/business");
      if (res.ok) {
        const d = await res.json();
        setBusinessName(d.name);
        localStorage.setItem("businessName", d.name);
      }
    } catch {}
  }

  function toggleSidebar() {
    window.dispatchEvent(new CustomEvent("toggle-sidebar"));
  }

  async function handleSignOut() {
    localStorage.removeItem("businessName");
    try { await signOut({ callbackUrl: "/login" }); }
    catch { window.location.href = "/login"; }
  }

  return (
    <div className="lg:hidden sticky top-0 z-50 -mx-4 sm:-mx-6">
      <div className="bg-[hsl(var(--surface)/0.96)] backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between gap-3 shadow-[var(--shadow-xs)]">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={toggleSidebar}
            className="shrink-0 p-1.5 rounded-[var(--radius-sm)] text-[hsl(var(--foreground-muted))] hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-foreground leading-none tracking-tight">ChainTrack</p>
            {businessName && (
              <p className="text-[11px] text-[hsl(var(--foreground-muted))] truncate mt-0.5 leading-none">
                {businessName}
              </p>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => router.push("/profile")}
            className="p-2 rounded-[var(--radius-sm)] text-[hsl(var(--foreground-muted))] hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-[var(--radius-sm)] text-[hsl(var(--foreground-muted))] hover:text-destructive hover:bg-red-50 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
