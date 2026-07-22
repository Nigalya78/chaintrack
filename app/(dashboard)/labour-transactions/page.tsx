"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"

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

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
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
          ...formData,
          chainsGiven: parseInt(formData.chainsGiven),
          chainsReceived: parseInt(formData.chainsReceived),
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          labourerId: "",
          chainType: "OT",
          chainsGiven: "",
          chainsReceived: "",
          transactionDate: new Date().toISOString().slice(0, 10),
          notes: "",
        })
        loadData()
      }
    } catch (error) {
      console.error("Failed to create transaction:", error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Labour Transactions</h1>
          <p className="text-muted-foreground">Record chains given to and received from labourers</p>
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
                <select
                  required
                  value={formData.labourerId}
                  onChange={(e) => setFormData({ ...formData, labourerId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Labourer</option>
                  {labourers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chain Type</label>
                <select
                  value={formData.chainType}
                  onChange={(e) => setFormData({ ...formData, chainType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="OT">OT</option>
                  <option value="MEDIUM">Medium</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chains Given</label>
                <input
                  type="number"
                  required
                  value={formData.chainsGiven}
                  onChange={(e) => setFormData({ ...formData, chainsGiven: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chains Received</label>
                <input
                  type="number"
                  required
                  value={formData.chainsReceived}
                  onChange={(e) => setFormData({ ...formData, chainsReceived: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  required
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Transaction</Button>
          </form>
        </Card>
      )}

      <Card title="Transaction History">
        <DataTable
          columns={["Date", "Labourer", "Type", "Given", "Received"]}
          rows={transactions.map((t) => [
            t.transactionDate,
            t.labourerName,
            t.chainType,
            t.chainsGiven,
            t.chainsReceived,
          ])}
        />
      </Card>
    </div>
  )
}
