"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type Labourer = {
  id: string
  name: string
  phone: string | null
  rateOt: number | null
  rateMedium: number | null
  active: boolean
}

export default function LabourPage() {
  const { data: session } = useSession()
  const [labourers, setLabourers] = useState<Labourer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    rateOt: "",
    rateMedium: "",
  })

  useEffect(() => {
    if (session?.user) {
      loadLabourers()
    }
  }, [session])

  async function loadLabourers() {
    try {
      const response = await fetch("/api/labourers")
      if (response.ok) {
        const data = await response.json()
        setLabourers(data)
      }
    } catch (error) {
      console.error("Failed to load labourers:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/labourers", {
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
        setFormData({ name: "", phone: "", rateOt: "", rateMedium: "" })
        loadLabourers()
      }
    } catch (error) {
      console.error("Failed to create labourer:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Labourers</h1>
          <p className="text-muted-foreground">Manage your labour workforce</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Labourer"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Labourer">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                <label className="text-sm font-medium">OT Rate (per piece)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rateOt}
                  onChange={(e) => setFormData({ ...formData, rateOt: e.target.value })}
                  placeholder="Enter OT rate"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium Rate (per piece)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rateMedium}
                  onChange={(e) => setFormData({ ...formData, rateMedium: e.target.value })}
                  placeholder="Enter Medium rate"
                />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Labourer</Button>
          </form>
        </Card>
      )}

      <Card title="All Labourers">
        <DataTable
          columns={["Name", "Phone", "OT Rate", "Medium Rate", "Status"]}
          rows={labourers.map((labourer) => [
            labourer.name,
            labourer.phone || "-",
            labourer.rateOt ? `Rs. ${labourer.rateOt}` : "-",
            labourer.rateMedium ? `Rs. ${labourer.rateMedium}` : "-",
            labourer.active ? "Active" : "Inactive",
          ])}
        />
      </Card>
    </div>
  )
}
