"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function MobileTopBar() {
  const { data: session } = useSession()
  const [businessName, setBusinessName] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Check localStorage first for cached data
    const cachedBusinessName = localStorage.getItem("businessName")
    if (cachedBusinessName) {
      setBusinessName(cachedBusinessName)
    }

    // Only fetch if we have a session and no cached data
    if (session?.user && !cachedBusinessName) {
      fetchBusinessName()
    }
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

  async function handleSignOut() {
    try {
      localStorage.removeItem("businessName")
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      console.error("Signout error:", error)
      // Fallback: redirect to login even if signout fails
      window.location.href = "/login"
    }
  }

  return (
    <div className="lg:hidden sticky top-0 z-50 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="bg-white p-3 shadow-md border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">ChainTrack</h1>
            {businessName && (
              <p className="text-sm text-gray-600">{businessName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <User className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
