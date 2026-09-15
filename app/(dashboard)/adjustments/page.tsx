"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NumericInput } from "@/components/ui/NumericInput"

const SELECT_CLS = "w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring hover:border-border transition-all duration-200"

type Adjustment = {
  id: string
  type: string
  quantity: number
  reason: string
  adjustmentDate: string
}

const TYPE_LABELS: Record<string, string> = {
  CHAIN_OT: "OT Chains",
  CHAIN_MEDIUM: "Medium Chains",
}

export default function AdjustmentsPage() {
  const { data: session } = useSession()
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    chainType: "OT",
    quantity: "",
    adjustmentType: "ADD" as "ADD" | "REMOVE",
    reason: "",
    adjustmentDate: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    if (session?.user) loadAdjustments()
  }, [session])

  async function loadAdjustments() {
    try {
      const response = await fetch("/api/adjustments")
      if (response.ok) setAdjustments(await response.json())
    } catch (error) {
      console.error("Failed to load adjustments:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, quantity: parseInt(formData.quantity) }),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          chainType: "OT", quantity: "", adjustmentType: "ADD",
          reason: "", adjustmentDate: new Date().toISOString().slice(0, 10),
        })
        loadAdjustments()
      }
    } catch (error) {
      console.error("Failed to create adjustment:", error)
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground text-sm">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventory Adjustments</h1>
          <p className="text-muted-foreground text-sm">Record manual stock corrections</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Adjustment"}
        </Button>
      </div>

      {showForm && (
        <Card title="New Adjustment">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chain Type</label>
                <select value={formData.chainType}
                  onChange={(e) => setFormData({ ...formData, chainType: e.target.value })}
                  className={SELECT_CLS}>
                  <option value="OT">OT Chains</option>
                  <option value="MEDIUM">Medium Chains</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adjustment Type</label>
                <select value={formData.adjustmentType}
                  onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value as "ADD" | "REMOVE" })}
                  className={SELECT_CLS}>
                  <option value="ADD">Add Stock</option>
                  <option value="REMOVE">Remove Stock</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity (chains)</label>
                <NumericInput allowDecimal={false} required min={1}
                  value={formData.quantity}
                  onChange={(v) => setFormData({ ...formData, quantity: v })}
                  placeholder="Number of chains"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input type="date" required value={formData.adjustmentDate}
                  onChange={(e) => setFormData({ ...formData, adjustmentDate: e.target.value })}
                  className={SELECT_CLS} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Reason</label>
                <Input type="text" required value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Damaged stock, physical count correction" />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Adjustment</Button>
          </form>
        </Card>
      )}

      <Card title="Adjustment History">
        <DataTable
          columns={["Date", "Type", "Action", "Quantity", "Reason"]}
          rows={adjustments.map((a) => [
            a.adjustmentDate,
            TYPE_LABELS[a.type] ?? a.type.replace(/_/g, " "),
            Number(a.quantity) >= 0 ? "Added" : "Removed",
            Math.abs(Number(a.quantity)),
            a.reason,
          ])}
        />
      </Card>
    </div>
  )
}
