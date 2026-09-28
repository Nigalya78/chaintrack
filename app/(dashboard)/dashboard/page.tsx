"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { StatCard } from "@/components/ui/Card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import { ShoppingBag, TrendingUp, Users, Store, Package, AlertCircle } from "lucide-react"

type DashboardStats = {
  businessName: string
  setupCompleted: boolean
  totalPurchases: number
  totalSales: number
  totalLabourers: number
  totalSuppliers: number
  totalShops: number
  stockOT: number
  stockMedium: number
  monthlySales: { month: string; amount: number }[]
  chainDistribution: { name: string; value: number }[]
}

const PIE_COLORS = ["#C9922A", "#1E2A3A"]

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-[hsl(214,18%,50%)]">₹{Number(payload[0].value).toLocaleString()}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (session?.user) loadStats() }, [session])
  useEffect(() => { if (stats?.businessName) localStorage.setItem("businessName", stats.businessName) }, [stats])

  async function loadStats() {
    try {
      const res = await fetch("/api/dashboard")
      if (res.ok) setStats(await res.json())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-40 bg-muted rounded" />
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
    </div>
  )

  if (!stats) return (
    <div className="flex items-center gap-3 text-[hsl(var(--foreground-muted))] p-6">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span className="text-sm">Failed to load dashboard data.</span>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Setup banner */}
      {!stats.setupCompleted && (
        <div className="flex items-start gap-3 bg-[hsl(43,95%,96%)] border border-[hsl(43,80%,80%)] rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 text-[#C9922A] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[hsl(43,50%,25%)]">Business Setup Pending</p>
            <p className="text-xs text-[hsl(43,40%,40%)] mt-0.5">
              <a
                href="/setup"
                onClick={e => { e.preventDefault(); localStorage.setItem("fromRegistration","false"); localStorage.setItem("previousPage","/dashboard"); window.location.href="/setup" }}
                className="font-semibold underline underline-offset-2"
              >
                Complete Setup →
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Page title */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{stats.businessName}</h1>
        <p className="text-xs sm:text-sm text-[hsl(var(--foreground-muted))] mt-0.5">Business overview</p>
      </div>

      {/* KPI grid — 2 cols always, 4 cols lg */}
      <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Purchases" value={`₹${(stats.totalPurchases/1000).toFixed(0)}k`}
          sub="Raw material" icon={<ShoppingBag className="h-3.5 w-3.5 text-orange-500" />} accent="bg-orange-50" />
        <StatCard label="Sales" value={`₹${(stats.totalSales/1000).toFixed(0)}k`}
          sub="Revenue" icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />} accent="bg-emerald-50" />
        <StatCard label="Labourers" value={stats.totalLabourers}
          sub="Workforce" icon={<Users className="h-3.5 w-3.5 text-blue-500" />} accent="bg-blue-50" />
        <StatCard label="Shops" value={stats.totalShops}
          sub={`${stats.totalSuppliers} suppliers`} icon={<Store className="h-3.5 w-3.5 text-violet-500" />} accent="bg-violet-50" />
      </div>

      {/* Stock cards */}
      <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
        <div className="bg-white rounded-xl border border-border shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">OT Stock</p>
            <div className="p-1.5 bg-[hsl(38,66%,93%)] rounded-lg">
              <Package className="h-3 w-3 text-[#C9922A]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.stockOT.toLocaleString()}</p>
          <p className="text-[10px] text-[hsl(var(--foreground-muted))] mt-0.5">finished chains</p>
          <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[#C9922A] rounded-full" style={{ width: `${stats.stockOT > 0 ? 65 : 0}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Medium</p>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Package className="h-3 w-3 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.stockMedium.toLocaleString()}</p>
          <p className="text-[10px] text-[hsl(var(--foreground-muted))] mt-0.5">finished chains</p>
          <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${stats.stockMedium > 0 ? 65 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Charts — stacked on mobile, side by side on md+ */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-sm font-semibold">Monthly Sales</p>
            <p className="text-[10px] text-[hsl(var(--foreground-muted))]">Last 6 months (₹)</p>
          </div>
          <div className="p-3 sm:p-4 h-48 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySales} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,91%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(222,14%,46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(222,14%,46%)" }} axisLine={false} tickLine={false} width={44}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "hsl(220,15%,95%)" }} />
                <Bar dataKey="amount" fill="#C9922A" radius={[3,3,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-sm font-semibold">Chain Distribution</p>
            <p className="text-[10px] text-[hsl(var(--foreground-muted))]">OT vs Medium</p>
          </div>
          <div className="p-3 sm:p-4 h-48 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.chainDistribution} cx="50%" cy="44%" outerRadius="58%" innerRadius="34%"
                  dataKey="value" paddingAngle={3}
                  label={({ name, percent }) => percent > 0.08 ? `${name} ${(percent*100).toFixed(0)}%` : ""}
                  labelLine={false}
                >
                  {stats.chainDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v.toLocaleString(), "chains"]} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
