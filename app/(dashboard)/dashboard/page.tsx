"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Store, ShoppingBag, Package } from "lucide-react"

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

const CHART_COLORS = ["#EAB308", "#3B82F6"]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) loadStats()
  }, [session])

  useEffect(() => {
    if (stats?.businessName) {
      localStorage.setItem("businessName", stats.businessName)
    }
  }, [stats])

  async function loadStats() {
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) setStats(await response.json())
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="p-8 text-muted-foreground">Failed to load dashboard data.</div>
  }

  return (
    <div className="space-y-6">
      {!stats.setupCompleted && (
        <div className="flex gap-3 items-start bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="mt-0.5 shrink-0 text-yellow-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Business Setup Pending</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Complete your setup to start tracking.{" "}
              <a
                href="/setup"
                onClick={(e) => {
                  e.preventDefault()
                  localStorage.setItem("fromRegistration", "false")
                  localStorage.setItem("previousPage", "/dashboard")
                  window.location.href = "/setup"
                }}
                className="underline font-medium"
              >
                Complete Setup →
              </a>
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.businessName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Business overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Purchases</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">₹{stats.totalPurchases.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Raw material cost</p>
            </div>
            <div className="shrink-0 p-2 bg-orange-50 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card className="col-span-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Sales</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">₹{stats.totalSales.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Chain sales revenue</p>
            </div>
            <div className="shrink-0 p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="col-span-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Labourers</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{stats.totalLabourers}</p>
              <p className="text-xs text-muted-foreground mt-1">Active workforce</p>
            </div>
            <div className="shrink-0 p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="col-span-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shops</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{stats.totalShops}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalSuppliers} suppliers</p>
            </div>
            <div className="shrink-0 p-2 bg-purple-50 rounded-lg">
              <Store className="h-4 w-4 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Stock summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="OT Chain Stock">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-50 rounded-lg shrink-0">
              <Package className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.stockOT.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">finished chains available</p>
            </div>
          </div>
        </Card>
        <Card title="Medium Chain Stock">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg shrink-0">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.stockMedium.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">finished chains available</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Monthly Sales (₹)">
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySales} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} width={50} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Sales"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Chain Stock Distribution">
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chainDistribution}
                  cx="50%"
                  cy="45%"
                  outerRadius="60%"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {stats.chainDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
