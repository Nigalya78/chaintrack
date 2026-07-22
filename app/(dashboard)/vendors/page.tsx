"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type Vendor = {
  id: string
  name: string
  phone: string | null
  area: string | null
  type: "SUPPLIER" | "FINISHING"
  rateOt: number | null
  rateMedium: number | null
}

export default function VendorsPage() {
  const { data: session } = useSession()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    area: "",
    type: "SUPPLIER" as "SUPPLIER" | "FINISHING",
    rateOt: "",
    rateMedium: "",
  })

  useEffect(() => {
    if (session?.user) {
      loadVendors()
    }
  }, [session])

  async function loadVendors() {
    try {
      const response = await fetch("/api/vendors")
      if (response.ok) {
        const data = await response.json()
        setVendors(data)
      }
    } catch (error) {
      console.error("Failed to load vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/vendors", {
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
        setFormData({
          name: "",
          phone: "",
          area: "",
          type: "SUPPLIER",
          rateOt: "",
          rateMedium: "",
        })
        loadVendors()
      }
    } catch (error) {
      console.error("Failed to create vendor:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your suppliers and finishing vendors</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Vendor"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Vendor">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "SUPPLIER" | "FINISHING" })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="SUPPLIER">Supplier</option>
                  <option value="FINISHING">Finishing Vendor</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <Input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Enter area"
                />
              </div>
              {formData.type === "FINISHING" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate per OT Chain (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rateOt}
                      onChange={(e) => setFormData({ ...formData, rateOt: e.target.value })}
                      placeholder="Enter rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate per Medium Chain (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rateMedium}
                      onChange={(e) => setFormData({ ...formData, rateMedium: e.target.value })}
                      placeholder="Enter rate"
                    />
                  </div>
                </>
              )}
            </div>
            <Button type="submit" variant="gold">Save Vendor</Button>
          </form>
        </Card>
      )}

      <Card title="All Vendors">
        <DataTable
          columns={["Type", "Name", "Phone", "Area", "Rate OT", "Rate Medium"]}
          rows={vendors.map((vendor) => [
            vendor.type === "SUPPLIER" ? "Supplier" : "Finishing",
            vendor.name,
            vendor.phone || "-",
            vendor.area || "-",
            vendor.rateOt ? `₹${vendor.rateOt}` : "-",
            vendor.rateMedium ? `₹${vendor.rateMedium}` : "-",
          ])}
        />
      </Card>
    </div>
  )
}
