import type { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MobileTopBar } from "@/components/MobileTopBar"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <Sidebar />

      <main className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        <div className="lg:hidden sticky top-0 z-50">
          <MobileTopBar />
        </div>

        <div className="flex-1 p-3 sm:p-5 lg:p-8">
          <div className="max-w-6xl mx-auto page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
