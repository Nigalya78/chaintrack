"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NumericInput } from "@/components/ui/NumericInput"

const SELECT_CLS = "w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring hover:border-border transition-all duration-200"

type Labourer = {
  id: string
  name: string
  rateOt: number | null
  rateMedium: number | null
}

type LabourTransaction = {
  id: string
  labourerName: string
  chainType: string
  chainsGiven: number
  chainsReceived: number
  ratePerPiece: number | null
  amountGiven: number | null
  transactionDate: string
  notes: string | null
}

export default function LabourTransactionsPage() {
  const { data: session } = useSession()
  const [labourers, setLabourers] = useState<Labourer[]>([])
  const [transactions, setTransactions] = useState<LabourTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    labourerId: "",
    chainType: "OT",
    chainsGiven: "",
    chainsReceived: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  // Show the selected labourer's rate as a hint
  const selectedLabourer = labourers.find((l) => l.id === formData.labourerId)
  const rateHint = selectedLabourer
    ? formData.chainType === "OT"
      ? selectedLabourer.rateOt
      : selectedLabourer.rateMedium
    : null

  // Live amount preview
  const amountPreview =
    rateHint && formData.chainsReceived
      ? (rateHint * parseInt(formData.chainsReceived)).toFixed(2)
      : null

  useEffect(() => {
    if (session?.user) loadData()
  }, [session])

  async function loadData() {
    try {
      const [labourersRes, transactionsRes] = await Promise.all([
        fetch("/api/labourers"),
        fetch("/api/labour-transactions"),
      ])
      if (labourersRes.ok) setLabourers(await labourersRes.json())
      if (transactionsRes.ok) setTransactions(await transactionsRes.json())
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/labour-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labourerId: formData.labourerId,
          chainType: formData.chainType,
          chainsGiven: parseInt(formData.chainsGiven),
          chainsReceived: parseInt(formData.chainsReceived),
          transactionDate: formData.transactionDate,
          notes: formData.notes || null,
        }),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          labourerId: "", chainType: "OT", chainsGiven: "", chainsReceived: "",
          transactionDate: new Date().toISOString().slice(0, 10), notes: "",
        })
        loadData()
      }
    } catch (error) {
      console.error("Failed to create transaction:", error)
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground text-sm">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Labour Transactions</h1>
          <p className="text-muted-foreground text-sm">Record chains given to and received from labourers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Transaction"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Transaction">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Labourer</label>
                <select required value={formData.labourerId}
                  onChange={(e) => setFormData({ ...formData, labourerId: e.target.value })}
                  className={SELECT_CLS}>
                  <option value="">Select Labourer</option>
                  {labourers.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chain Type</label>
                <select value={formData.chainType}
                  onChange={(e) => setFormData({ ...formData, chainType: e.target.value })}
                  className={SELECT_CLS}>
                  <option value="OT">OT</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chains Given</label>
                <NumericInput allowDecimal={false} required
                  value={formData.chainsGiven}
                  onChange={(v) => setFormData({ ...formData, chainsGiven: v })}
                  placeholder="Chains given to labourer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chains Received</label>
                <NumericInput allowDecimal={false} required
                  value={formData.chainsReceived}
                  onChange={(v) => setFormData({ ...formData, chainsReceived: v })}
                  placeholder="Chains received back"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input type="date" required value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  className={SELECT_CLS} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input type="text" value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes" />
              </div>
            </div>

            {/* Rate + amount preview */}
            {rateHint != null && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm space-y-1">
                <div>
                  <span className="text-yellow-800 font-medium">Rate: </span>
                  <span className="text-yellow-900 font-bold">₹{rateHint}</span>
                  <span className="text-yellow-700 ml-1">per {formData.chainType} chain</span>
                </div>
                {amountPreview && (
                  <div>
                    <span className="text-yellow-800 font-medium">Labour Amount: </span>
                    <span className="text-yellow-900 font-bold">₹{amountPreview}</span>
                    <span className="text-yellow-700 ml-1">({formData.chainsReceived} received × ₹{rateHint})</span>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" variant="gold">Save Transaction</Button>
          </form>
        </Card>
      )}

      <Card title="Transaction History">
        <DataTable
          columns={["Date", "Labourer", "Type", "Given", "Received", "Rate", "Amount"]}
          rows={transactions.map((t) => [
            t.transactionDate,
            t.labourerName,
            t.chainType,
            t.chainsGiven,
            t.chainsReceived,
            t.ratePerPiece ? `₹${Number(t.ratePerPiece).toFixed(2)}` : "-",
            t.amountGiven ? `₹${Number(t.amountGiven).toFixed(2)}` : "-",
          ])}
        />
      </Card>
    </div>
  )
}
