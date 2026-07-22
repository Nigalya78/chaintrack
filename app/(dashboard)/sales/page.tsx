"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"

type Shop = {
  id: string
  name: string
}

type Sale = {
  id: string
  shopName: string
  chainType: string
  chainsSold: number
  ratePerPiece: number | null
  totalAmount: number | null
  saleDate: string
  notes: string | null
}

export default function SalesPage() {
  const { data: session } = useSession()
  const [shops, setShops] = useState<Shop[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    shopId: "",
    chainType: "OT",
    chainsSold: "",
    ratePerPiece: "",
    saleDate: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  async function loadData() {
    try {
      const [shopsRes, salesRes] = await Promise.all([
        fetch("/api/shops"),
        fetch("/api/sales"),
      ])
      if (shopsRes.ok) setShops(await shopsRes.json())
      if (salesRes.ok) setSales(await salesRes.json())
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          chainsSold: parseInt(formData.chainsSold),
          ratePerPiece: formData.ratePerPiece ? parseFloat(formData.ratePerPiece) : null,
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          shopId: "",
          chainType: "OT",
          chainsSold: "",
          ratePerPiece: "",
          saleDate: new Date().toISOString().slice(0, 10),
          notes: "",
        })
        loadData()
      }
    } catch (error) {
      console.error("Failed to create sale:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Record chain sales to shops</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Sale"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Sale">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop</label>
                <select
                  required
                  value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Shop</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chain Type</label>
                <select
                  value={formData.chainType}
                  onChange={(e) => setFormData({ ...formData, chainType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="OT">OT</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chains Sold</label>
                <input
                  type="number"
                  required
                  value={formData.chainsSold}
                  onChange={(e) => setFormData({ ...formData, chainsSold: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rate per Piece</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ratePerPiece}
                  onChange={(e) => setFormData({ ...formData, ratePerPiece: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sale Date</label>
                <input
                  type="date"
                  required
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Sale</Button>
          </form>
        </Card>
      )}

      <Card title="Sales History">
        <DataTable
          columns={["Date", "Shop", "Type", "Chains", "Total"]}
          rows={sales.map((s) => [
            s.saleDate,
            s.shopName,
            s.chainType,
            s.chainsSold,
            s.totalAmount ? `Rs. ${s.totalAmount.toFixed(2)}` : "-",
          ])}
        />
      </Card>
    </div>
  )
}
