import type { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"
import { BottomNav } from "@/components/BottomNav"
import { MobileTopBar } from "@/components/MobileTopBar"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-w-0 pb-24 lg:pb-8 p-4 sm:p-6 lg:p-8">
        <MobileTopBar />
        {/* Spacer so content starts below the sticky mobile top bar */}
        <div className="lg:hidden h-3" />
        {/* Constrain content width on very wide screens for readability */}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
