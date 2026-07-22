"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"

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
    packetCount: "",
    pricePerKg: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  })

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
          ...formData,
          kilograms: parseFloat(formData.kilograms),
          packetCount: parseInt(formData.packetCount),
          pricePerKg: parseFloat(formData.pricePerKg),
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          supplierId: "",
          chainType: "OT",
          kilograms: "",
          packetCount: "",
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
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
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
                <label className="text-sm font-medium">Kilograms</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formData.kilograms}
                  onChange={(e) => setFormData({ ...formData, kilograms: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Packet Count</label>
                <input
                  type="number"
                  value={formData.packetCount}
                  onChange={(e) => setFormData({ ...formData, packetCount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Kg</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Date</label>
                <input
                  type="date"
                  required
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Purchase</Button>
          </form>
        </Card>
      )}

      <Card title="Purchase History">
        <DataTable
          columns={["Date", "Supplier", "Type", "Kg", "Total"]}
          rows={purchases.map((purchase) => [
            purchase.purchaseDate,
            purchase.supplierName,
            purchase.chainType,
            purchase.kilograms.toFixed(3),
            `Rs. ${purchase.totalCost.toFixed(2)}`,
          ])}
        />
      </Card>
    </div>
  )
}
