"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { NumericInput } from "@/components/ui/NumericInput"

type Supplier = {
  id: string
  name: string
}

type Purchase = {
  id: string
  supplierName: string
  chainType: string
  kilograms: number
  packetCount: number
  pricePerKg: number
  totalCost: number
  purchaseDate: string
}

const CHAINS_PER_KG: Record<string, number> = { OT: 24, MEDIUM: 40 }

export default function PurchasesPage() {
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    supplierId: "",
    chainType: "OT",
    kilograms: "",
    pricePerKg: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  })

  // Derived: auto-calculate packet count from kg + chain type
  const chainsPerKg = CHAINS_PER_KG[formData.chainType] ?? 24
  const autoPacketCount = formData.kilograms
    ? Math.round(parseFloat(formData.kilograms) * chainsPerKg)
    : 0
  const totalCost =
    formData.kilograms && formData.pricePerKg
      ? (parseFloat(formData.kilograms) * parseFloat(formData.pricePerKg)).toFixed(2)
      : null

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  async function loadData() {
    try {
      const [suppliersRes, purchasesRes] = await Promise.all([
        fetch("/api/suppliers"),
        fetch("/api/purchases"),
      ])
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json())
      if (purchasesRes.ok) setPurchases(await purchasesRes.json())
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: formData.supplierId,
          chainType: formData.chainType,
          kilograms: parseFloat(formData.kilograms),
          pricePerKg: parseFloat(formData.pricePerKg),
          purchaseDate: formData.purchaseDate,
          // packetCount omitted — API will calculate it
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          supplierId: "",
          chainType: "OT",
          kilograms: "",
          pricePerKg: "",
          purchaseDate: new Date().toISOString().slice(0, 10),
        })
        loadData()
      }
    } catch (error) {
      console.error("Failed to create purchase:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Record raw material purchases from suppliers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Purchase"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Purchase">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <select
                  required
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chain Type</label>
                <select
                  value={formData.chainType}
                  onChange={(e) => setFormData({ ...formData, chainType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="OT">OT</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kilograms</label>
                <NumericInput
                  step="0.001"
                  required
                  value={formData.kilograms}
                  onChange={(v) => setFormData({ ...formData, kilograms: v })}
                  placeholder="e.g. 2.500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Packet Count
                  <span className="ml-1 text-xs text-muted-foreground font-normal">
                    (auto: {chainsPerKg} chains/kg)
                  </span>
                </label>
                <div className="w-full px-4 py-2.5 rounded-lg border border-border/30 bg-muted/40 text-sm text-muted-foreground select-none">
                  {autoPacketCount > 0 ? (
                    <span className="font-semibold text-foreground">{autoPacketCount}</span>
                  ) : (
                    <span>Enter kg above</span>
                  )}
                  {autoPacketCount > 0 && (
                    <span className="ml-1 text-xs">
                      ({formData.kilograms} kg × {chainsPerKg})
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Kg (₹)</label>
                <NumericInput
                  step="0.01"
                  required
                  value={formData.pricePerKg}
                  onChange={(v) => setFormData({ ...formData, pricePerKg: v })}
                  placeholder="e.g. 5500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Date</label>
                <input
                  type="date"
                  required
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Live total preview */}
            {totalCost && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm">
                <span className="text-yellow-800 font-medium">Total Cost: </span>
                <span className="text-yellow-900 font-bold">₹{totalCost}</span>
                <span className="text-yellow-700 ml-2">
                  ({formData.kilograms} kg × ₹{formData.pricePerKg}/kg)
                </span>
              </div>
            )}

            <Button type="submit" variant="gold">Save Purchase</Button>
          </form>
        </Card>
      )}

      <Card title="Purchase History">
        <DataTable
          columns={["Date", "Supplier", "Type", "Kg", "Chains", "Total"]}
          rows={purchases.map((p) => [
            p.purchaseDate,
            p.supplierName,
            p.chainType,
            Number(p.kilograms).toFixed(3),
            p.packetCount,
            `₹${Number(p.totalCost).toFixed(2)}`,
          ])}
        />
      </Card>
    </div>
  )
}
