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

type Labourer = { id: string; name: string; rateOt: number | null; rateMedium: number | null }
type LabourTx = { id: string; labourerName: string; chainType: string; chainsGiven: number; chainsReceived: number; ratePerPiece: number | null; amountGiven: number | null; transactionDate: string }

export default function LabourTransactionsPage() {
  const { data: session } = useSession()
  const [labourers, setLabourers] = useState<Labourer[]>([])
  const [txs, setTxs] = useState<LabourTx[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState({ labourerId: "", chainType: "OT", chainsGiven: "", chainsReceived: "", transactionDate: new Date().toISOString().slice(0, 10), notes: "" })

  const sel = labourers.find(l => l.id === f.labourerId)
  const rate = sel ? (f.chainType === "OT" ? sel.rateOt : sel.rateMedium) : null
  const amtPrev = rate && f.chainsReceived ? (rate * parseInt(f.chainsReceived)).toFixed(2) : null

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const [l, t] = await Promise.all([fetch("/api/labourers"), fetch("/api/labour-transactions")])
    if (l.ok) setLabourers(await l.json())
    if (t.ok) setTxs(await t.json())
    setLoading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/labour-transactions", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labourerId: f.labourerId, chainType: f.chainType, chainsGiven: parseInt(f.chainsGiven), chainsReceived: parseInt(f.chainsReceived), transactionDate: f.transactionDate, notes: f.notes || null }) })
    if (res.ok) { setShowForm(false); setF({ labourerId: "", chainType: "OT", chainsGiven: "", chainsReceived: "", transactionDate: new Date().toISOString().slice(0, 10), notes: "" }); load() }
  }

  if (loading) return <div className="p-6 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div>
      <PageHeader title="Labour" subtitle="Chains given to and received from labourers"
        action={<Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4"/>Cancel</> : <><Plus className="h-4 w-4"/>Add</>}
        </Button>} />

      {showForm && (
        <Card title="New Labour Transaction" className="mb-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Labourer<span className="text-destructive ml-0.5">*</span></label>
                <select required value={f.labourerId} onChange={e => setF(p => ({ ...p, labourerId: e.target.value }))} className={S.select}>
                  <option value="">Select labourer</option>
                  {labourers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
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
                <label className="block text-sm font-medium">Received<span className="text-destructive ml-0.5">*</span></label>
                <NumericInput allowDecimal={false} required value={f.chainsReceived} onChange={v => setF(p => ({ ...p, chainsReceived: v }))} placeholder="Chains back" />
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
            {rate != null && (
              <div className={S.infoBanner + " space-y-0.5"}>
                <p className="text-xs"><span className="font-semibold">Rate:</span> ₹{rate}/{f.chainType} chain</p>
                {amtPrev && <p className="text-xs"><span className="font-semibold">Amount:</span> ₹{amtPrev}</p>}
              </div>
            )}
            <Button type="submit" variant="gold" size="sm">Save</Button>
          </form>
        </Card>
      )}

      <Card title="Transaction History" subtitle={`${txs.length} records`}>
        <DataTable
          columns={["Date", "Labourer", "Type", "Given", "Recv", "Amt"]}
          rows={txs.map(t => [t.transactionDate, t.labourerName, t.chainType, t.chainsGiven, t.chainsReceived, t.amountGiven ? `₹${Number(t.amountGiven).toLocaleString()}` : "-"])}
        />
      </Card>
    </div>
  )
}
