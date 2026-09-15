"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NumericInput } from "@/components/ui/NumericInput"

const SELECT_CLS = "w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring hover:border-border transition-all duration-200"

type Shop = { id: string; name: string }

type Sale = {
  id: string
  shopName: string
  chainType: string
  chainCount: number
  pricePerChain: number | null
  totalAmount: number | null
  saleDate: string
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
    chainCount: "",
    pricePerChain: "",
    saleDate: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  // Live total preview
  const totalPreview =
    formData.chainCount && formData.pricePerChain
      ? (parseFloat(formData.chainCount) * parseFloat(formData.pricePerChain)).toFixed(2)
      : null

  useEffect(() => {
    if (session?.user) loadData()
  }, [session])

  async function loadData() {
    try {
      const [shopsRes, salesRes] = await Promise.all([fetch("/api/shops"), fetch("/api/sales")])
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
          shopId: formData.shopId,
          chainType: formData.chainType,
          chainCount: parseInt(formData.chainCount),
          pricePerChain: formData.pricePerChain ? parseFloat(formData.pricePerChain) : null,
          saleDate: formData.saleDate,
          notes: formData.notes || null,
        }),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          shopId: "", chainType: "OT", chainCount: "", pricePerChain: "",
          saleDate: new Date().toISOString().slice(0, 10), notes: "",
        })
        loadData()
      }
    } catch (error) {
      console.error("Failed to create sale:", error)
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground text-sm">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground text-sm">Record chain sales to shops</p>
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
                <select required value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                  className={SELECT_CLS}>
                  <option value="">Select Shop</option>
                  {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chain Type</label>
                <select value={formData.chainType}
                  onChange={(e) => setFormData({ ...formData, chainType: e.target.value })}
                  className={SELECT_CLS}>
                  <option value="OT">OT</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chains Sold</label>
                <NumericInput allowDecimal={false} required
                  value={formData.chainCount}
                  onChange={(v) => setFormData({ ...formData, chainCount: v })}
                  placeholder="Number of chains"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rate per Chain (₹)</label>
                <NumericInput step="0.01"
                  value={formData.pricePerChain}
                  onChange={(v) => setFormData({ ...formData, pricePerChain: v })}
                  placeholder="Price per chain"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sale Date</label>
                <input type="date" required value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  className={SELECT_CLS} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input type="text" value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes" />
              </div>
            </div>
            {totalPreview && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm">
                <span className="text-yellow-800 font-medium">Total Amount: </span>
                <span className="text-yellow-900 font-bold">₹{totalPreview}</span>
                <span className="text-yellow-700 ml-2">({formData.chainCount} chains × ₹{formData.pricePerChain})</span>
              </div>
            )}
            <Button type="submit" variant="gold">Save Sale</Button>
          </form>
        </Card>
      )}

      <Card title="Sales History">
        <DataTable
          columns={["Date", "Shop", "Type", "Chains", "Rate", "Total"]}
          rows={sales.map((s) => [
            s.saleDate,
            s.shopName,
            s.chainType,
            s.chainCount,
            s.pricePerChain ? `₹${Number(s.pricePerChain).toFixed(2)}` : "-",
            s.totalAmount ? `₹${Number(s.totalAmount).toFixed(2)}` : "-",
          ])}
        />
      </Card>
    </div>
  )
}
