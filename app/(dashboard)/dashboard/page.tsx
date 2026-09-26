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

const PIE_COLORS = ["#EAB308", "#3B82F6"]

/* ── Custom tooltip for bar chart ─────────────────────── */
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[hsl(var(--surface))] border border-border rounded-[var(--radius)] shadow-[var(--shadow-md)] px-3 py-2 text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-[hsl(var(--foreground-muted))]">₹{Number(payload[0].value).toLocaleString()}</p>
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
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-52 bg-muted rounded-[var(--radius)]" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-[var(--radius-xl)]" />)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-[var(--radius-xl)]" />)}
      </div>
    </div>
  )

  if (!stats) return (
    <div className="flex items-center gap-3 text-[hsl(var(--foreground-muted))] p-8">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span className="text-sm">Failed to load dashboard data.</span>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Setup banner */}
      {!stats.setupCompleted && (
        <div className="flex items-start gap-3 bg-[hsl(43,95%,96%)] border border-[hsl(43,80%,80%)] rounded-[var(--radius-xl)] px-5 py-4">
          <AlertCircle className="h-4 w-4 text-[hsl(43,70%,40%)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[hsl(43,50%,25%)]">Business Setup Pending</p>
            <p className="text-sm text-[hsl(43,40%,40%)] mt-0.5">
              Complete your setup to start tracking.{" "}
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.businessName}</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">Business overview</p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Purchases"
          value={`₹${stats.totalPurchases.toLocaleString()}`}
          sub="Raw material cost"
          icon={<ShoppingBag className="h-4 w-4 text-orange-500" />}
          accent="bg-orange-50"
        />
        <StatCard
          label="Total Sales"
          value={`₹${stats.totalSales.toLocaleString()}`}
          sub="Revenue"
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          accent="bg-emerald-50"
        />
        <StatCard
          label="Labourers"
          value={stats.totalLabourers}
          sub="Active workforce"
          icon={<Users className="h-4 w-4 text-blue-500" />}
          accent="bg-blue-50"
        />
        <StatCard
          label="Shops"
          value={stats.totalShops}
          sub={`${stats.totalSuppliers} supplier${stats.totalSuppliers !== 1 ? "s" : ""}`}
          icon={<Store className="h-4 w-4 text-violet-500" />}
          accent="bg-violet-50"
        />
      </div>

      {/* ── Stock cards ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-sm)] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">OT Chain Stock</p>
            <div className="p-2 bg-[hsl(43,95%,94%)] rounded-[var(--radius-sm)]">
              <Package className="h-3.5 w-3.5 text-[hsl(43,80%,42%)]" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">{stats.stockOT.toLocaleString()}</p>
          <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">finished chains available</p>
          <div className="mt-3 h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div className="h-full bg-[hsl(43,95%,50%)] rounded-full" style={{ width: `${Math.min(100, stats.stockOT > 0 ? 60 : 0)}%` }} />
          </div>
        </div>
        <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-sm)] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Medium Chain Stock</p>
            <div className="p-2 bg-blue-50 rounded-[var(--radius-sm)]">
              <Package className="h-3.5 w-3.5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">{stats.stockMedium.toLocaleString()}</p>
          <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">finished chains available</p>
          <div className="mt-3 h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, stats.stockMedium > 0 ? 60 : 0)}%` }} />
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Bar chart */}
        <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60">
            <p className="text-[15px] font-semibold text-foreground">Monthly Sales</p>
            <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">Last 6 months revenue (₹)</p>
          </div>
          <div className="p-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySales} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,91%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(222,14%,46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(222,14%,46%)" }} axisLine={false} tickLine={false} width={48}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "hsl(220,15%,95%)" }} />
                <Bar dataKey="amount" fill="hsl(43,95%,50%)" radius={[4,4,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60">
            <p className="text-[15px] font-semibold text-foreground">Chain Distribution</p>
            <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">OT vs Medium stock split</p>
          </div>
          <div className="p-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.chainDistribution} cx="50%" cy="46%" outerRadius="62%" innerRadius="38%"
                  dataKey="value" paddingAngle={3}
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                  labelLine={false}
                >
                  {stats.chainDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v.toLocaleString(), "chains"]} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
