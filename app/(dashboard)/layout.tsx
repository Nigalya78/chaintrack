import type { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"
import { BottomNav } from "@/components/BottomNav"
import { MobileTopBar } from "@/components/MobileTopBar"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 ml-0 pb-20 lg:pb-0 p-4 sm:p-6 lg:p-8">
        <MobileTopBar />
        <div className="lg:hidden h-4"></div>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
