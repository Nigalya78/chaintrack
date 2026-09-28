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
    <div className="w-full bg-[hsl(214,32%,14%)] border-b border-[hsl(214,32%,22%)] shadow-sm">
      <div className="h-14 px-3 flex items-center justify-between gap-2">

        {/* Left — hamburger + brand */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburger */}
          <button
            onClick={toggleSidebar}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-[hsl(214,15%,60%)] hover:text-white hover:bg-[hsl(214,32%,22%)] transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo mark + "ChainTrack" text — always visible */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Small logo mark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              aria-hidden
              style={{ height: "30px", width: "30px", minWidth: "30px" }}
              className="object-contain rounded"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight tracking-tight">
                Chain<span className="text-[#C9922A]">Track</span>
              </p>
              {businessName && (
                <p className="text-[9px] text-[hsl(214,15%,50%)] truncate leading-tight">{businessName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => router.push("/profile")}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[hsl(214,15%,60%)] hover:text-white hover:bg-[hsl(214,32%,22%)] transition-colors active:scale-95"
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[hsl(214,15%,60%)] hover:text-red-400 hover:bg-red-950/30 transition-colors active:scale-95"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
