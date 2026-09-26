"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NumericInput } from "@/components/ui/NumericInput"
import { S } from "@/lib/form-styles"
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react"

type Adjustment = { id: string; type: string; quantity: number; reason: string; adjustmentDate: string }

const TYPE_LABELS: Record<string, string> = { CHAIN_OT: "OT Chains", CHAIN_MEDIUM: "Medium Chains" }

export default function AdjustmentsPage() {
  const { data: session } = useSession()
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState({ chainType: "OT", quantity: "", adjustmentType: "ADD" as "ADD"|"REMOVE", reason: "", adjustmentDate: new Date().toISOString().slice(0, 10) })

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const res = await fetch("/api/adjustments")
    if (res.ok) setAdjustments(await res.json())
    setLoading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/adjustments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, quantity: parseInt(f.quantity) }),
    })
    if (res.ok) { setShowForm(false); setF({ chainType: "OT", quantity: "", adjustmentType: "ADD", reason: "", adjustmentDate: new Date().toISOString().slice(0, 10) }); load() }
  }

  if (loading) return <div className="p-8 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Adjustments</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">Manual stock corrections</p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Add Adjustment</>}
        </Button>
      </div>

      {showForm && (
        <Card title="New Adjustment">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Chain Type</label>
                <select value={f.chainType} onChange={e => setF(p => ({ ...p, chainType: e.target.value }))} className={S.select}>
                  <option value="OT">OT Chains</option>
                  <option value="MEDIUM">Medium Chains</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Adjustment Type</label>
                <select value={f.adjustmentType} onChange={e => setF(p => ({ ...p, adjustmentType: e.target.value as "ADD"|"REMOVE" }))} className={S.select}>
                  <option value="ADD">Add Stock</option>
                  <option value="REMOVE">Remove Stock</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Quantity (chains)<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput allowDecimal={false} required min={1} value={f.quantity} onChange={v => setF(p => ({ ...p, quantity: v }))} placeholder="Number of chains" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Date<span className="text-destructive ml-0.5">*</span></label>
                <input type="date" required value={f.adjustmentDate} onChange={e => setF(p => ({ ...p, adjustmentDate: e.target.value }))} className={S.date} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-sm font-medium">Reason<span className="text-destructive ml-0.5">*</span></label>
                <Input required value={f.reason} onChange={e => setF(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Damaged stock, physical count correction" />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Adjustment</Button>
          </form>
        </Card>
      )}

      <Card title="Adjustment History" subtitle={`${adjustments.length} record${adjustments.length !== 1 ? "s" : ""}`}>
        <DataTable
          columns={["Date", "Type", "Action", "Qty", "Reason"]}
          rows={adjustments.map(a => [
            a.adjustmentDate,
            TYPE_LABELS[a.type] ?? a.type.replace(/_/g, " "),
            <span key={a.id} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${Number(a.quantity) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {Number(a.quantity) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Number(a.quantity) >= 0 ? "Added" : "Removed"}
            </span>,
            Math.abs(Number(a.quantity)).toLocaleString(),
            a.reason,
          ])}
        />
      </Card>
    </div>
  )
}
