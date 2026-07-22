"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

type DashboardStats = {
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      loadStats()
    }
  }, [session])

  async function loadStats() {
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!stats) {
    return <div className="p-8">Failed to load dashboard data</div>
  }

  return (
    <div className="space-y-6">
      {!stats.setupCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">Business Setup Pending</h3>
              <p className="text-sm text-yellow-700">Complete your business setup to start tracking inventory and transactions. <a href="/setup" className="underline font-medium">Complete Setup</a></p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Overview of your business operations</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Purchases">
          <div className="text-2xl sm:text-3xl font-bold">Rs. {stats.totalPurchases.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">Total raw material purchases</p>
        </Card>
        <Card title="Total Sales">
          <div className="text-2xl sm:text-3xl font-bold">Rs. {stats.totalSales.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">Total chain sales</p>
        </Card>
        <Card title="Labourers">
          <div className="text-2xl sm:text-3xl font-bold">{stats.totalLabourers}</div>
          <p className="text-sm text-muted-foreground">Active labour workforce</p>
        </Card>
        <Card title="Suppliers">
          <div className="text-2xl sm:text-3xl font-bold">{stats.totalSuppliers}</div>
          <p className="text-sm text-muted-foreground">Raw material suppliers</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Current Stock">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">OT Chains</div>
              <div className="text-2xl font-bold">{stats.stockOT} chains</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Medium Chains</div>
              <div className="text-2xl font-bold">{stats.stockMedium} chains</div>
            </div>
          </div>
        </Card>
        <Card title="Business Entities">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Shops</div>
              <div className="text-2xl font-bold">{stats.totalShops}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Monthly Sales">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Chain Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.chainDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.chainDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
