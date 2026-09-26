"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { NumericInput } from "@/components/ui/NumericInput"
import { S } from "@/lib/form-styles"
import { Plus, X } from "lucide-react"

type Supplier = { id: string; name: string }
type Purchase = {
  id: string; supplierName: string; chainType: string
  kilograms: number; packetCount: number; pricePerKg: number
  totalCost: number; purchaseDate: string
}

const CHAINS_PER_KG: Record<string, number> = { OT: 24, MEDIUM: 40 }

export default function PurchasesPage() {
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    supplierId: "", chainType: "OT", kilograms: "", pricePerKg: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  })

  const chainsPerKg    = CHAINS_PER_KG[formData.chainType] ?? 24
  const autoPackets    = formData.kilograms ? Math.round(parseFloat(formData.kilograms) * chainsPerKg) : 0
  const totalCostPrev  = formData.kilograms && formData.pricePerKg
    ? (parseFloat(formData.kilograms) * parseFloat(formData.pricePerKg)).toFixed(2) : null

  useEffect(() => { if (session?.user) loadData() }, [session])

  async function loadData() {
    const [s, p] = await Promise.all([fetch("/api/suppliers"), fetch("/api/purchases")])
    if (s.ok) setSuppliers(await s.json())
    if (p.ok) setPurchases(await p.json())
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/purchases", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: formData.supplierId, chainType: formData.chainType,
        kilograms: parseFloat(formData.kilograms), pricePerKg: parseFloat(formData.pricePerKg),
        purchaseDate: formData.purchaseDate,
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setFormData({ supplierId: "", chainType: "OT", kilograms: "", pricePerKg: "", purchaseDate: new Date().toISOString().slice(0, 10) })
      loadData()
    }
  }

  if (loading) return <div className="p-8 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">Record raw material purchases from suppliers</p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Add Purchase</>}
        </Button>
      </div>

      {showForm && (
        <Card title="New Purchase">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Supplier<span className="text-destructive ml-0.5">*</span></label>
                <select required value={formData.supplierId} onChange={e => setFormData(p => ({ ...p, supplierId: e.target.value }))} className={S.select}>
                  <option value="">Select supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Chain Type</label>
                <select value={formData.chainType} onChange={e => setFormData(p => ({ ...p, chainType: e.target.value }))} className={S.select}>
                  <option value="OT">OT</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Kilograms<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput step="0.001" required value={formData.kilograms} onChange={v => setFormData(p => ({ ...p, kilograms: v }))} placeholder="e.g. 2.500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[hsl(var(--foreground-muted))]">
                  Chain Count <span className="font-normal">(auto · {chainsPerKg}/kg)</span>
                </label>
                <div className="px-3.5 py-2.5 rounded-[var(--radius)] border border-border/50 bg-[hsl(var(--muted)/0.4)] text-sm">
                  {autoPackets > 0
                    ? <><span className="font-semibold text-foreground">{autoPackets.toLocaleString()}</span><span className="text-[hsl(var(--foreground-muted))] ml-1.5 text-xs">{formData.kilograms} kg × {chainsPerKg}</span></>
                    : <span className="text-[hsl(var(--foreground-muted))]">Enter kg above</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Price per kg (₹)<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput step="0.01" required value={formData.pricePerKg} onChange={v => setFormData(p => ({ ...p, pricePerKg: v }))} placeholder="e.g. 5500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Purchase Date<span className="text-destructive ml-0.5">*</span></label>
                <input type="date" required value={formData.purchaseDate} onChange={e => setFormData(p => ({ ...p, purchaseDate: e.target.value }))} className={S.date} />
              </div>
            </div>
            {totalCostPrev && (
              <div className={S.infoBanner}>
                <span className="font-semibold">Total Cost: ₹{totalCostPrev}</span>
                <span className="ml-2 opacity-70">({formData.kilograms} kg × ₹{formData.pricePerKg}/kg)</span>
              </div>
            )}
            <Button type="submit" variant="gold">Save Purchase</Button>
          </form>
        </Card>
      )}

      <Card title="Purchase History" subtitle={`${purchases.length} record${purchases.length !== 1 ? "s" : ""}`}>
        <DataTable
          columns={["Date", "Supplier", "Type", "Kg", "Chains", "Total"]}
          rows={purchases.map(p => [
            p.purchaseDate, p.supplierName, p.chainType,
            Number(p.kilograms).toFixed(3), p.packetCount.toLocaleString(),
            `₹${Number(p.totalCost).toLocaleString()}`,
          ])}
        />
      </Card>
    </div>
  )
}
