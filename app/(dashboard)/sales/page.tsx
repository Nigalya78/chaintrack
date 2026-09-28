"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PageHeader } from "@/components/ui/PageHeader"
import { NumericInput } from "@/components/ui/NumericInput"
import { S } from "@/lib/form-styles"
import { Plus, X } from "lucide-react"

type Shop = { id: string; name: string }
type Sale = { id: string; shopName: string; chainType: string; chainCount: number; pricePerChain: number | null; totalAmount: number | null; saleDate: string }

export default function SalesPage() {
  const { data: session } = useSession()
  const [shops, setShops] = useState<Shop[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState({ shopId: "", chainType: "OT", chainCount: "", pricePerChain: "", saleDate: new Date().toISOString().slice(0, 10), notes: "" })

  const totalPrev = f.chainCount && f.pricePerChain ? (parseFloat(f.chainCount) * parseFloat(f.pricePerChain)).toFixed(2) : null

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const [sh, sa] = await Promise.all([fetch("/api/shops"), fetch("/api/sales")])
    if (sh.ok) setShops(await sh.json())
    if (sa.ok) setSales(await sa.json())
    setLoading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: f.shopId, chainType: f.chainType, chainCount: parseInt(f.chainCount), pricePerChain: f.pricePerChain ? parseFloat(f.pricePerChain) : null, saleDate: f.saleDate, notes: f.notes || null }) })
    if (res.ok) { setShowForm(false); setF({ shopId: "", chainType: "OT", chainCount: "", pricePerChain: "", saleDate: new Date().toISOString().slice(0, 10), notes: "" }); load() }
  }

  if (loading) return <div className="p-6 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div>
      <PageHeader title="Sales" subtitle="Chain sales to shops"
        action={<Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4"/>Cancel</> : <><Plus className="h-4 w-4"/>Add</>}
        </Button>} />

      {showForm && (
        <Card title="New Sale" className="mb-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Shop<span className="text-destructive ml-0.5">*</span></label>
                <select required value={f.shopId} onChange={e => setF(p => ({ ...p, shopId: e.target.value }))} className={S.select}>
                  <option value="">Select shop</option>
                  {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                <label className="block text-sm font-medium">Chains Sold<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput allowDecimal={false} required value={f.chainCount} onChange={v => setF(p => ({ ...p, chainCount: v }))} placeholder="Number of chains" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Rate/Chain (₹)</label>
                <NumericInput step="0.01" value={f.pricePerChain} onChange={v => setF(p => ({ ...p, pricePerChain: v }))} placeholder="Price per chain" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Date<span className="text-destructive ml-0.5">*</span></label>
                <input type="date" required value={f.saleDate} onChange={e => setF(p => ({ ...p, saleDate: e.target.value }))} className={S.date} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Notes</label>
                <Input value={f.notes} onChange={e => setF(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            {totalPrev && <div className={S.infoBanner}><span className="font-semibold">Total: ₹{totalPrev}</span><span className="opacity-70 ml-2 text-xs">({f.chainCount} × ₹{f.pricePerChain})</span></div>}
            <Button type="submit" variant="gold" size="sm">Save Sale</Button>
          </form>
        </Card>
      )}

      <Card title="Sales History" subtitle={`${sales.length} records`}>
        <DataTable
          columns={["Date", "Shop", "Type", "Chains", "Rate", "Total"]}
          rows={sales.map(s => [s.saleDate, s.shopName, s.chainType, s.chainCount, s.pricePerChain ? `₹${Number(s.pricePerChain).toFixed(2)}` : "-", s.totalAmount ? `₹${Number(s.totalAmount).toLocaleString()}` : "-"])}
        />
      </Card>
    </div>
  )
}
