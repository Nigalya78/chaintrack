"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"

type InventoryItem = {
  type: string
  quantity: number
  unit: string
}

type OpeningBalance = {
  kanniOtKg: number
  kanniMediumKg: number
  otChains: number
  mediumChains: number
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [openingBalance, setOpeningBalance] = useState<OpeningBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editForm, setEditForm] = useState({
    kanniOtKg: "",
    kanniMediumKg: "",
    otChains: "",
    mediumChains: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadInventory()
      loadOpeningBalance()
    }
  }, [session])

  async function loadInventory() {
    try {
      const response = await fetch("/api/inventory")
      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      }
    } catch (error) {
      console.error("Failed to load inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadOpeningBalance() {
    try {
      const response = await fetch("/api/opening-balance")
      if (response.ok) {
        const data = await response.json()
        setOpeningBalance(data)
        setEditForm({
          kanniOtKg: data.kanniOtKg.toString(),
          kanniMediumKg: data.kanniMediumKg.toString(),
          otChains: data.otChains.toString(),
          mediumChains: data.mediumChains.toString(),
        })
      }
    } catch (error) {
      console.error("Failed to load opening balance:", error)
    }
  }

  async function handleSaveOpeningBalance(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch("/api/opening-balance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kanniOtKg: parseFloat(editForm.kanniOtKg) || 0,
          kanniMediumKg: parseFloat(editForm.kanniMediumKg) || 0,
          otChains: parseInt(editForm.otChains) || 0,
          mediumChains: parseInt(editForm.mediumChains) || 0,
        }),
      })

      if (response.ok) {
        setShowEditForm(false)
        loadOpeningBalance()
        loadInventory()
      }
    } catch (error) {
      console.error("Failed to update opening balance:", error)
      alert("Failed to update opening balance")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm sm:text-base">View and manage your current stock levels</p>
        </div>
        <Button onClick={() => setShowEditForm(!showEditForm)}>
          {showEditForm ? "Cancel" : "Edit Opening Balance"}
        </Button>
      </div>

      {showEditForm && (
        <Card title="Edit Opening Balance">
          <form onSubmit={handleSaveOpeningBalance} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kanni OT (kg)</label>
                <input
                  type="number"
                  step="0.001"
                  value={editForm.kanniOtKg}
                  onChange={(e) => setEditForm({ ...editForm, kanniOtKg: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kanni Medium (kg)</label>
                <input
                  type="number"
                  step="0.001"
                  value={editForm.kanniMediumKg}
                  onChange={(e) => setEditForm({ ...editForm, kanniMediumKg: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OT Chains (pieces)</label>
                <input
                  type="number"
                  value={editForm.otChains}
                  onChange={(e) => setEditForm({ ...editForm, otChains: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium Chains (pieces)</label>
                <input
                  type="number"
                  value={editForm.mediumChains}
                  onChange={(e) => setEditForm({ ...editForm, mediumChains: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="gold" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Current Stock">
        <DataTable
          columns={["Type", "Quantity", "Unit"]}
          rows={inventory.map((item) => [
            item.type.replace(/_/g, " "),
            item.quantity.toString(),
            item.unit,
          ])}
        />
      </Card>
    </div>
  )
}
