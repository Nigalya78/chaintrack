"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { User, LogOut, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

export function MobileTopBar() {
  const { data: session } = useSession()
  const [businessName, setBusinessName] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const cachedBusinessName = localStorage.getItem("businessName")
    if (cachedBusinessName) setBusinessName(cachedBusinessName)
    if (session?.user && !cachedBusinessName) fetchBusinessName()
  }, [session])

  async function fetchBusinessName() {
    try {
      const response = await fetch("/api/business")
      if (response.ok) {
        const data = await response.json()
        setBusinessName(data.name)
        localStorage.setItem("businessName", data.name)
      }
    } catch (error) {
      console.error("Failed to fetch business name:", error)
    }
  }

  function handleToggleSidebar() {
    // Dispatch a custom event that Sidebar listens to
    window.dispatchEvent(new CustomEvent("toggle-sidebar"))
  }

  async function handleSignOut() {
    try {
      localStorage.removeItem("businessName")
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      console.error("Signout error:", error)
      window.location.href = "/login"
    }
  }

  return (
    <div className="lg:hidden sticky top-0 z-50 -mx-4 sm:-mx-6">
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 shadow-sm border-b border-border/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleToggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 leading-tight">ChainTrack</h1>
              {businessName && (
                <p className="text-xs text-gray-500 truncate">{businessName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Profile"
            >
              <User className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
