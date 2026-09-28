"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/ui/PageHeader"
import { NumericInput } from "@/components/ui/NumericInput"
import { S } from "@/lib/form-styles"
import { Plus, X } from "lucide-react"

type Supplier = { id: string; name: string }
type Purchase = { id: string; supplierName: string; chainType: string; kilograms: number; packetCount: number; pricePerKg: number; totalCost: number; purchaseDate: string }
const CHAINS_PER_KG: Record<string, number> = { OT: 24, MEDIUM: 40 }

export default function PurchasesPage() {
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState({ supplierId: "", chainType: "OT", kilograms: "", pricePerKg: "", purchaseDate: new Date().toISOString().slice(0, 10) })

  const chainsPerKg = CHAINS_PER_KG[f.chainType] ?? 24
  const autoPackets = f.kilograms ? Math.round(parseFloat(f.kilograms) * chainsPerKg) : 0
  const totalPrev = f.kilograms && f.pricePerKg ? (parseFloat(f.kilograms) * parseFloat(f.pricePerKg)).toFixed(2) : null

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const [s, p] = await Promise.all([fetch("/api/suppliers"), fetch("/api/purchases")])
    if (s.ok) setSuppliers(await s.json())
    if (p.ok) setPurchases(await p.json())
    setLoading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/purchases", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId: f.supplierId, chainType: f.chainType, kilograms: parseFloat(f.kilograms), pricePerKg: parseFloat(f.pricePerKg), purchaseDate: f.purchaseDate }) })
    if (res.ok) { setShowForm(false); setF({ supplierId: "", chainType: "OT", kilograms: "", pricePerKg: "", purchaseDate: new Date().toISOString().slice(0, 10) }); load() }
  }

  if (loading) return <div className="p-6 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div>
      <PageHeader title="Purchases" subtitle="Raw material from suppliers"
        action={<Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4"/>Cancel</> : <><Plus className="h-4 w-4"/>Add</>}
        </Button>} />

      {showForm && (
        <Card title="New Purchase" className="mb-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Supplier<span className="text-destructive ml-0.5">*</span></label>
                <select required value={f.supplierId} onChange={e => setF(p => ({ ...p, supplierId: e.target.value }))} className={S.select}>
                  <option value="">Select supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Chain Type</label>
                <select value={f.chainType} onChange={e => setF(p => ({ ...p, chainType: e.target.value }))} className={S.select}>
                  <option value="OT">OT</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Kilograms<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput step="0.001" required value={f.kilograms} onChange={v => setF(p => ({ ...p, kilograms: v }))} placeholder="e.g. 2.500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-medium text-[hsl(var(--foreground-muted))]">Chains (auto · {chainsPerKg}/kg)</label>
                <div className="px-3.5 py-2.5 rounded-lg border border-border/50 bg-muted/40 text-sm">
                  {autoPackets > 0 ? <><span className="font-semibold text-foreground">{autoPackets.toLocaleString()}</span><span className="text-[hsl(var(--foreground-muted))] ml-1 text-xs">= {f.kilograms}kg × {chainsPerKg}</span></> : <span className="text-[hsl(var(--foreground-muted))]">—</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Price/kg (₹)<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput step="0.01" required value={f.pricePerKg} onChange={v => setF(p => ({ ...p, pricePerKg: v }))} placeholder="e.g. 5500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Date<span className="text-destructive ml-0.5">*</span></label>
                <input type="date" required value={f.purchaseDate} onChange={e => setF(p => ({ ...p, purchaseDate: e.target.value }))} className={S.date} />
              </div>
            </div>
            {totalPrev && <div className={S.infoBanner}><span className="font-semibold">Total: ₹{totalPrev}</span><span className="opacity-70 ml-2 text-xs">({f.kilograms}kg × ₹{f.pricePerKg})</span></div>}
            <Button type="submit" variant="gold" size="sm">Save Purchase</Button>
          </form>
        </Card>
      )}

      <Card title="Purchase History" subtitle={`${purchases.length} records`}>
        <DataTable
          columns={["Date", "Supplier", "Type", "Kg", "Chains", "Total"]}
          rows={purchases.map(p => [p.purchaseDate, p.supplierName, p.chainType, Number(p.kilograms).toFixed(3), p.packetCount.toLocaleString(), `₹${Number(p.totalCost).toLocaleString()}` ])}
        />
      </Card>
    </div>
  )
}
