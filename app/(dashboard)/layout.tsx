import type { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"
import { BottomNav } from "@/components/BottomNav"
import { MobileTopBar } from "@/components/MobileTopBar"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <Sidebar />

      <main className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        {/* Mobile sticky top bar */}
        <MobileTopBar />

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-[76px] lg:pb-8">
          <div className="max-w-6xl mx-auto page-enter">
            {children}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
