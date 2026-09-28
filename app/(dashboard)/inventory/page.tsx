"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/ui/PageHeader"
import { NumericInput } from "@/components/ui/NumericInput"
import { Package, Layers, Sparkles, Edit2 } from "lucide-react"

type InventoryItem = { type: string; quantity: number; unit: string }
const CHAINS_PER_KG: Record<string, number> = { OT: 24, MEDIUM: 40 }
const META: Record<string, { label: string; sub: string; icon: React.ReactNode; color: string; chainType?: string }> = {
  KANNI_OT:             { label: "Kanni — OT",         sub: "Raw material", icon: <Layers className="h-4 w-4" />,   color: "bg-amber-50 text-amber-600",   chainType: "OT" },
  KANNI_MEDIUM:         { label: "Kanni — Medium",     sub: "Raw material", icon: <Layers className="h-4 w-4" />,   color: "bg-amber-50 text-amber-600",   chainType: "MEDIUM" },
  CHAIN_OT:             { label: "Chains — OT",        sub: "Unfinished",   icon: <Package className="h-4 w-4" />,  color: "bg-blue-50 text-blue-500" },
  CHAIN_MEDIUM:         { label: "Chains — Medium",    sub: "Unfinished",   icon: <Package className="h-4 w-4" />,  color: "bg-blue-50 text-blue-500" },
  FINISHED_CHAIN_OT:    { label: "Finished — OT",      sub: "Ready",        icon: <Sparkles className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-600" },
  FINISHED_CHAIN_MEDIUM:{ label: "Finished — Medium",  sub: "Ready",        icon: <Sparkles className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-600" },
}
const ORDER = ["KANNI_OT","KANNI_MEDIUM","CHAIN_OT","CHAIN_MEDIUM","FINISHED_CHAIN_OT","FINISHED_CHAIN_MEDIUM"]

export default function InventoryPage() {
  const { data: session } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [ef, setEf] = useState({ kanniOtKg: "", kanniMediumKg: "", otChains: "", mediumChains: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (session?.user) { loadInv(); loadOB() } }, [session])

  async function loadInv() {
    const res = await fetch("/api/inventory")
    if (res.ok) setInventory(await res.json())
    setLoading(false)
  }
  async function loadOB() {
    const res = await fetch("/api/opening-balance")
    if (res.ok) {
      const d = await res.json()
      setEf({ kanniOtKg: String(d.kanniOtKg), kanniMediumKg: String(d.kanniMediumKg), otChains: String(d.otChains), mediumChains: String(d.mediumChains) })
    }
  }
  async function saveOB(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch("/api/opening-balance", { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kanniOtKg: parseFloat(ef.kanniOtKg)||0, kanniMediumKg: parseFloat(ef.kanniMediumKg)||0, otChains: parseInt(ef.otChains)||0, mediumChains: parseInt(ef.mediumChains)||0 }) })
    if (res.ok) { setShowEdit(false); await Promise.all([loadInv(), loadOB()]) }
    setSaving(false)
  }

  if (loading) return <div className="p-6 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  const sorted = ORDER.map(t => inventory.find(i => i.type === t)).filter(Boolean) as InventoryItem[]

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Live stock levels"
        action={<Button variant="outline" size="sm" onClick={() => setShowEdit(!showEdit)}>
          <Edit2 className="h-3.5 w-3.5" />{showEdit ? "Cancel" : "Edit Opening"}
        </Button>} />

      {showEdit && (
        <Card title="Edit Opening Balance" className="mb-4">
          <form onSubmit={saveOB} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="block text-sm font-medium">Kanni OT (kg)</label><NumericInput step="0.001" value={ef.kanniOtKg} onChange={v => setEf(p => ({ ...p, kanniOtKg: v }))} /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Kanni Medium (kg)</label><NumericInput step="0.001" value={ef.kanniMediumKg} onChange={v => setEf(p => ({ ...p, kanniMediumKg: v }))} /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">OT Chains</label><NumericInput allowDecimal={false} value={ef.otChains} onChange={v => setEf(p => ({ ...p, otChains: v }))} /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Medium Chains</label><NumericInput allowDecimal={false} value={ef.mediumChains} onChange={v => setEf(p => ({ ...p, mediumChains: v }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="gold" size="sm" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowEdit(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* 2-col grid on mobile, 3-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {sorted.map(item => {
          const m = META[item.type]
          const qty = Number(item.quantity)
          const isKanni = item.type.startsWith("KANNI_")
          const chains = isKanni && m?.chainType ? Math.floor(qty * CHAINS_PER_KG[m.chainType]) : null

          return (
            <div key={item.type} className="bg-white rounded-xl border border-border shadow-sm p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] leading-tight">{m?.sub}</p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5 leading-tight">{m?.label}</p>
                </div>
                <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${m?.color}`}>{m?.icon}</div>
              </div>
              {isKanni ? (
                <>
                  <p className="text-lg sm:text-2xl font-bold text-foreground leading-none">{qty.toFixed(3)}<span className="text-xs font-normal text-[hsl(var(--foreground-muted))] ml-1">kg</span></p>
                  <p className="text-[9px] sm:text-xs text-[hsl(var(--foreground-muted))] mt-1">≈ {chains?.toLocaleString()} chains</p>
                </>
              ) : (
                <p className="text-lg sm:text-2xl font-bold text-foreground leading-none">{qty.toLocaleString()}<span className="text-xs font-normal text-[hsl(var(--foreground-muted))] ml-1">pcs</span></p>
              )}
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-sm text-[hsl(var(--foreground-muted))]">
          No inventory records. Complete setup to initialise stock.
        </div>
      )}
    </div>
  )
}
