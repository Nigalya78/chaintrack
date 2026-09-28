"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog } from "@/components/ui/Dialog"
import { PageHeader } from "@/components/ui/PageHeader"
import { NumericInput } from "@/components/ui/NumericInput"
import { S } from "@/lib/form-styles"
import { Pencil, Trash2, Plus, X } from "lucide-react"

type Labourer = { id: string; name: string; phone: string|null; rateOt: number|null; rateMedium: number|null; active: boolean }
type FD = { name: string; phone: string; rateOt: string; rateMedium: string }
const empty: FD = { name: "", phone: "", rateOt: "", rateMedium: "" }

export default function LabourPage() {
  const { data: session } = useSession()
  const [rows, setRows] = useState<Labourer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [fd, setFd] = useState<FD>(empty)
  const [edit, setEdit] = useState<Labourer|null>(null)
  const [ef, setEf] = useState<FD>(empty)
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState<Labourer|null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const res = await fetch("/api/labourers")
    if (res.ok) setRows(await res.json())
    setLoading(false)
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/labourers", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fd, rateOt: fd.rateOt ? parseFloat(fd.rateOt) : null, rateMedium: fd.rateMedium ? parseFloat(fd.rateMedium) : null }) })
    if (res.ok) { setShowForm(false); setFd(empty); load() }
  }

  function openEdit(r: Labourer) { setEdit(r); setEf({ name: r.name, phone: r.phone ?? "", rateOt: r.rateOt != null ? String(r.rateOt) : "", rateMedium: r.rateMedium != null ? String(r.rateMedium) : "" }) }

  async function update(e: React.FormEvent) {
    e.preventDefault()
    if (!edit) return
    setSaving(true)
    const res = await fetch(`/api/labourers/${edit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: ef.name, phone: ef.phone, rateOt: ef.rateOt ? parseFloat(ef.rateOt) : null, rateMedium: ef.rateMedium ? parseFloat(ef.rateMedium) : null }) })
    if (res.ok) { setEdit(null); load() }
    setSaving(false)
  }

  async function doDelete() {
    if (!del) return
    setDeleting(true)
    const res = await fetch(`/api/labourers/${del.id}`, { method: "DELETE" })
    if (res.ok) { setDel(null); load() }
    setDeleting(false)
  }

  if (loading) return <div className="p-6 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div>
      <PageHeader title="Labourers" subtitle={`${rows.length} worker${rows.length !== 1 ? "s" : ""}`}
        action={<Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4"/>Cancel</> : <><Plus className="h-4 w-4"/>Add</>}
        </Button>} />

      {showForm && (
        <Card title="New Labourer" className="mb-4">
          <form onSubmit={create} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="block text-sm font-medium">Name<span className="text-destructive ml-0.5">*</span></label><Input required value={fd.name} onChange={e => setFd(p => ({ ...p, name: e.target.value }))} placeholder="Full name" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Phone</label><Input type="tel" value={fd.phone} onChange={e => setFd(p => ({ ...p, phone: e.target.value }))} placeholder="Optional" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">OT Rate (₹)</label><NumericInput step="0.01" value={fd.rateOt} onChange={v => setFd(p => ({ ...p, rateOt: v }))} placeholder="e.g. 2.50" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Medium Rate (₹)</label><NumericInput step="0.01" value={fd.rateMedium} onChange={v => setFd(p => ({ ...p, rateMedium: v }))} placeholder="e.g. 1.75" /></div>
            </div>
            <Button type="submit" variant="gold" size="sm">Save Labourer</Button>
          </form>
        </Card>
      )}

      <Card title="All Labourers">
        <DataTable
          columns={["Name", "Phone", "OT ₹", "Med ₹", "Status", ""]}
          rows={rows.map(r => [
            r.name, r.phone || "-",
            r.rateOt ? `₹${r.rateOt}` : "-",
            r.rateMedium ? `₹${r.rateMedium}` : "-",
            <span key={r.id} className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full ${r.active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-[hsl(var(--foreground-muted))]"}`}>{r.active ? "Active" : "Inactive"}</span>,
            <div key={r.id+"a"} className="flex items-center gap-1">
              <button onClick={() => openEdit(r)} className={S.iconBtn} title="Edit"><Pencil className="h-3.5 w-3.5"/></button>
              <button onClick={() => setDel(r)} className={S.iconBtnDanger} title="Delete"><Trash2 className="h-3.5 w-3.5"/></button>
            </div>,
          ])}
        />
      </Card>

      <Dialog open={edit !== null} onClose={() => setEdit(null)} title="Edit Labourer">
        <form onSubmit={update} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="block text-sm font-medium">Name<span className="text-destructive ml-0.5">*</span></label><Input required value={ef.name} onChange={e => setEf(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium">Phone</label><Input type="tel" value={ef.phone} onChange={e => setEf(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium">OT Rate (₹)</label><NumericInput step="0.01" value={ef.rateOt} onChange={v => setEf(p => ({ ...p, rateOt: v }))} /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium">Medium Rate (₹)</label><NumericInput step="0.01" value={ef.rateMedium} onChange={v => setEf(p => ({ ...p, rateMedium: v }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button>
            <Button type="submit" variant="gold" size="sm" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={del !== null} onClose={() => setDel(null)} title="Delete Labourer" description="This cannot be undone.">
        <p className="text-sm text-[hsl(var(--foreground-muted))] mb-4">Delete <span className="font-semibold text-foreground">{del?.name}</span>?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDel(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={doDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button>
        </div>
      </Dialog>
    </div>
  )
}
