"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { NumericInput } from "@/components/ui/NumericInput"

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

const CHAINS_PER_KG: Record<string, number> = { OT: 24, MEDIUM: 40 }

// Human-readable labels and category groupings
const INVENTORY_META: Record<string, { label: string; category: string; chainType?: string }> = {
  KANNI_OT:            { label: "Kanni — OT",            category: "Raw Material (Kanni)", chainType: "OT" },
  KANNI_MEDIUM:        { label: "Kanni — Medium",        category: "Raw Material (Kanni)", chainType: "MEDIUM" },
  CHAIN_OT:            { label: "Chains — OT",           category: "Unfinished Chains" },
  CHAIN_MEDIUM:        { label: "Chains — Medium",       category: "Unfinished Chains" },
  FINISHED_CHAIN_OT:   { label: "Finished Chains — OT",  category: "Finished Chains" },
  FINISHED_CHAIN_MEDIUM: { label: "Finished Chains — Medium", category: "Finished Chains" },
}

function formatKanniRow(item: InventoryItem) {
  const meta = INVENTORY_META[item.type]
  const chainType = meta?.chainType
  const kg = Number(item.quantity)
  if (!chainType) return { display: `${kg.toFixed(3)} kg`, secondary: null }

  const cPerKg = CHAINS_PER_KG[chainType]
  const chains = Math.floor(kg * cPerKg)
  return {
    display: `${kg.toFixed(3)} kg`,
    secondary: `≈ ${chains.toLocaleString()} chains  (${cPerKg} chains/kg)`,
  }
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
        await Promise.all([loadOpeningBalance(), loadInventory()])
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

  // Group inventory rows by category
  const typeOrder = ["KANNI_OT", "KANNI_MEDIUM", "CHAIN_OT", "CHAIN_MEDIUM", "FINISHED_CHAIN_OT", "FINISHED_CHAIN_MEDIUM"]
  const sorted = typeOrder
    .map((t) => inventory.find((i) => i.type === t))
    .filter(Boolean) as InventoryItem[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm">View and manage your current stock levels</p>
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
                <NumericInput
                  step="0.001"
                  value={editForm.kanniOtKg}
                  onChange={(v) => setEditForm({ ...editForm, kanniOtKg: v })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kanni Medium (kg)</label>
                <NumericInput
                  step="0.001"
                  value={editForm.kanniMediumKg}
                  onChange={(v) => setEditForm({ ...editForm, kanniMediumKg: v })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OT Chains (pieces)</label>
                <NumericInput
                  allowDecimal={false}
                  value={editForm.otChains}
                  onChange={(v) => setEditForm({ ...editForm, otChains: v })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium Chains (pieces)</label>
                <NumericInput
                  allowDecimal={false}
                  value={editForm.mediumChains}
                  onChange={(v) => setEditForm({ ...editForm, mediumChains: v })}
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

      {/* Inventory cards grouped by category */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((item) => {
          const meta = INVENTORY_META[item.type] ?? { label: item.type, category: "Other" }
          const isKanni = item.type.startsWith("KANNI_")
          const qty = Number(item.quantity)
          const kanniInfo = isKanni ? formatKanniRow(item) : null

          return (
            <div
              key={item.type}
              className="rounded-xl border border-border/50 bg-card shadow-sm p-4 flex flex-col gap-1"
            >
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {meta.category}
              </div>
              <div className="text-sm font-semibold text-foreground mt-1">{meta.label}</div>
              {isKanni && kanniInfo ? (
                <>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {kanniInfo.display}
                  </div>
                  <div className="text-xs text-muted-foreground">{kanniInfo.secondary}</div>
                </>
              ) : (
                <div className="text-2xl font-bold text-primary mt-1">
                  {qty.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">pieces</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      {sorted.length === 0 && (
        <Card title="Current Stock">
          <p className="text-sm text-muted-foreground py-4 text-center">No inventory records found. Complete setup to initialize stock.</p>
        </Card>
      )}
    </div>
  )
}
