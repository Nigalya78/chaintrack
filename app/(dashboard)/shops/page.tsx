"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"

type Shop = {
  id: string
  name: string
  phone: string | null
  area: string | null
  rateOt: number | null
  rateMedium: number | null
  active: boolean
}

export default function ShopsPage() {
  const { data: session } = useSession()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    area: "",
    rateOt: "",
    rateMedium: "",
  })

  useEffect(() => {
    if (session?.user) {
      loadShops()
    }
  }, [session])

  async function loadShops() {
    try {
      const response = await fetch("/api/shops")
      if (response.ok) {
        const data = await response.json()
        setShops(data)
      }
    } catch (error) {
      console.error("Failed to load shops:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rateOt: formData.rateOt ? parseFloat(formData.rateOt) : null,
          rateMedium: formData.rateMedium ? parseFloat(formData.rateMedium) : null,
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({ name: "", phone: "", area: "", rateOt: "", rateMedium: "" })
        loadShops()
      }
    } catch (error) {
      console.error("Failed to create shop:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Shops</h1>
          <p className="text-muted-foreground">Manage your sales outlets</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Shop"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Shop">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OT Rate (per piece)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateOt}
                  onChange={(e) => setFormData({ ...formData, rateOt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium Rate (per piece)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateMedium}
                  onChange={(e) => setFormData({ ...formData, rateMedium: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Shop</Button>
          </form>
        </Card>
      )}

      <Card title="All Shops">
        <DataTable
          columns={["Name", "Phone", "Area", "OT Rate", "Medium Rate", "Status"]}
          rows={shops.map((shop) => [
            shop.name,
            shop.phone || "-",
            shop.area || "-",
            shop.rateOt ? `Rs. ${shop.rateOt}` : "-",
            shop.rateMedium ? `Rs. ${shop.rateMedium}` : "-",
            shop.active ? "Active" : "Inactive",
          ])}
        />
      </Card>
    </div>
  )
}
