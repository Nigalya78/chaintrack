"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PageHeader } from "@/components/ui/PageHeader"
import { Plus, X } from "lucide-react"

type Supplier = { id: string; name: string; phone: string; area: string|null }

export default function SuppliersPage() {
  const { data: session } = useSession()
  const [rows, setRows] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [fd, setFd] = useState({ name: "", phone: "", area: "" })

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const res = await fetch("/api/suppliers")
    if (res.ok) setRows(await res.json())
    setLoading(false)
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fd) })
    if (res.ok) { setShowForm(false); setFd({ name: "", phone: "", area: "" }); load() }
  }

  if (loading) return <div className="p-6 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div>
      <PageHeader title="Suppliers" subtitle="Raw material suppliers"
        action={<Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4"/>Cancel</> : <><Plus className="h-4 w-4"/>Add</>}
        </Button>} />

      {showForm && (
        <Card title="New Supplier" className="mb-4">
          <form onSubmit={create} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="block text-sm font-medium">Name<span className="text-destructive ml-0.5">*</span></label><Input required value={fd.name} onChange={e => setFd(p => ({ ...p, name: e.target.value }))} placeholder="Supplier name" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Phone<span className="text-destructive ml-0.5">*</span></label><Input type="tel" required value={fd.phone} onChange={e => setFd(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" /></div>
              <div className="space-y-1.5 sm:col-span-2"><label className="block text-sm font-medium">Area</label><Input value={fd.area} onChange={e => setFd(p => ({ ...p, area: e.target.value }))} placeholder="City / area (optional)" /></div>
            </div>
            <Button type="submit" variant="gold" size="sm">Save Supplier</Button>
          </form>
        </Card>
      )}

      <Card title="All Suppliers">
        <DataTable columns={["Name", "Phone", "Area"]} rows={rows.map(r => [r.name, r.phone, r.area || "-"])} />
      </Card>
    </div>
  )
}
