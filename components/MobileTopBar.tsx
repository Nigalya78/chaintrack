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
    if (session?.user && !cached) fetchBusiness();
  }, [session]);

  async function fetchBusiness() {
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
      {/* Brand navy top bar */}
      <div className="bg-[hsl(214,32%,14%)] border-b border-[hsl(214,32%,22%)] px-4 h-14 flex items-center justify-between gap-3 shadow-[var(--shadow-sm)]">

        {/* Left: hamburger + logo + name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={toggleSidebar}
            className="shrink-0 p-1.5 rounded-[var(--radius-sm)] text-[hsl(214,15%,55%)] hover:text-white hover:bg-[hsl(214,32%,22%)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* dark-logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dark-logo.png" alt="ChainTrack" width={140} height={36} className="object-contain shrink-0" />
          {businessName && (
            <span className="text-[10px] text-[hsl(214,15%,50%)] truncate leading-none hidden sm:block border-l border-[hsl(214,32%,26%)] pl-2.5 ml-0.5">{businessName}</span>
          )}
        </div>

        {/* Right: profile + signout */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => router.push("/profile")}
            className="p-2 rounded-[var(--radius-sm)] text-[hsl(214,15%,55%)] hover:text-white hover:bg-[hsl(214,32%,22%)] transition-colors"
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-[var(--radius-sm)] text-[hsl(214,15%,55%)] hover:text-red-400 hover:bg-red-950/30 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
