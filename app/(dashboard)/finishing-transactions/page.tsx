"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NumericInput } from "@/components/ui/NumericInput"

const SELECT_CLS = "w-full px-4 py-2.5 rounded-lg border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring hover:border-border transition-all duration-200"

type Vendor = { id: string; name: string }

type FinishingTransaction = {
  id: string
  vendorName: string
  chainType: string
  chainsGiven: number
  finishedChainsReceived: number
  ratePerPiece: number | null
  transactionDate: string
  notes: string | null
}

export default function FinishingTransactionsPage() {
  const { data: session } = useSession()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [transactions, setTransactions] = useState<FinishingTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vendorId: "",
    chainType: "OT",
    chainsGiven: "",
    finishedChainsReceived: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  useEffect(() => {
    if (session?.user) loadData()
  }, [session])

  async function loadData() {
    try {
      const [vendorsRes, transactionsRes] = await Promise.all([
        fetch("/api/finishing-vendors"),
        fetch("/api/finishing-transactions"),
      ])
      if (vendorsRes.ok) setVendors(await vendorsRes.json())
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
      const response = await fetch("/api/finishing-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: formData.vendorId,
          chainType: formData.chainType,
          chainsGiven: parseInt(formData.chainsGiven),
          finishedChainsReceived: parseInt(formData.finishedChainsReceived),
          transactionDate: formData.transactionDate,
          notes: formData.notes || null,
        }),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          vendorId: "", chainType: "OT", chainsGiven: "", finishedChainsReceived: "",
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finishing Transactions</h1>
          <p className="text-muted-foreground text-sm">Record chains sent to and received from finishing vendors</p>
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
                <label className="text-sm font-medium">Vendor</label>
                <select required value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className={SELECT_CLS}>
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
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
                  placeholder="Chains sent to vendor"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Finished Chains Received</label>
                <NumericInput allowDecimal={false} required
                  value={formData.finishedChainsReceived}
                  onChange={(v) => setFormData({ ...formData, finishedChainsReceived: v })}
                  placeholder="Finished chains back"
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
            <Button type="submit" variant="gold">Save Transaction</Button>
          </form>
        </Card>
      )}

      <Card title="Transaction History">
        <DataTable
          columns={["Date", "Vendor", "Type", "Given", "Received"]}
          rows={transactions.map((t) => [
            t.transactionDate,
            t.vendorName,
            t.chainType,
            t.chainsGiven,
            t.finishedChainsReceived,
          ])}
        />
      </Card>
    </div>
  )
}
