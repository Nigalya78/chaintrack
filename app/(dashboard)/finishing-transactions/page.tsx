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

type Vendor = { id: string; name: string }
type FinishingTx = { id: string; vendorName: string; chainType: string; chainsGiven: number; finishedChainsReceived: number; transactionDate: string }

export default function FinishingTransactionsPage() {
  const { data: session } = useSession()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [txs, setTxs] = useState<FinishingTx[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState({ vendorId: "", chainType: "OT", chainsGiven: "", finishedChainsReceived: "", transactionDate: new Date().toISOString().slice(0, 10), notes: "" })

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const [v, t] = await Promise.all([fetch("/api/finishing-vendors"), fetch("/api/finishing-transactions")])
    if (v.ok) setVendors(await v.json())
    if (t.ok) setTxs(await t.json())
    setLoading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/finishing-transactions", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: f.vendorId, chainType: f.chainType, chainsGiven: parseInt(f.chainsGiven), finishedChainsReceived: parseInt(f.finishedChainsReceived), transactionDate: f.transactionDate, notes: f.notes || null }) })
    if (res.ok) { setShowForm(false); setF({ vendorId: "", chainType: "OT", chainsGiven: "", finishedChainsReceived: "", transactionDate: new Date().toISOString().slice(0, 10), notes: "" }); load() }
  }

  if (loading) return <div className="p-6 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div>
      <PageHeader title="Finishing" subtitle="Chains sent to and received from finishing vendors"
        action={<Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4"/>Cancel</> : <><Plus className="h-4 w-4"/>Add</>}
        </Button>} />

      {showForm && (
        <Card title="New Finishing Transaction" className="mb-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Vendor<span className="text-destructive ml-0.5">*</span></label>
                <select required value={f.vendorId} onChange={e => setF(p => ({ ...p, vendorId: e.target.value }))} className={S.select}>
                  <option value="">Select vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
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
                <label className="block text-sm font-medium">Given<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput allowDecimal={false} required value={f.chainsGiven} onChange={v => setF(p => ({ ...p, chainsGiven: v }))} placeholder="Chains sent" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Finished Received<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput allowDecimal={false} required value={f.finishedChainsReceived} onChange={v => setF(p => ({ ...p, finishedChainsReceived: v }))} placeholder="Chains back" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Date<span className="text-destructive ml-0.5">*</span></label>
                <input type="date" required value={f.transactionDate} onChange={e => setF(p => ({ ...p, transactionDate: e.target.value }))} className={S.date} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Notes</label>
                <Input value={f.notes} onChange={e => setF(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <Button type="submit" variant="gold" size="sm">Save</Button>
          </form>
        </Card>
      )}

      <Card title="Transaction History" subtitle={`${txs.length} records`}>
        <DataTable
          columns={["Date", "Vendor", "Type", "Given", "Recv"]}
          rows={txs.map(t => [t.transactionDate, t.vendorName, t.chainType, t.chainsGiven, t.finishedChainsReceived])}
        />
      </Card>
    </div>
  )
}
