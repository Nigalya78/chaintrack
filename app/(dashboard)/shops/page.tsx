"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog } from "@/components/ui/Dialog"
import { NumericInput } from "@/components/ui/NumericInput"
import { S } from "@/lib/form-styles"
import { Pencil, Trash2, Plus, X } from "lucide-react"

type Shop = { id: string; name: string; phone: string|null; area: string|null; rateOt: number|null; rateMedium: number|null; active: boolean }
type FD = { name: string; phone: string; area: string; rateOt: string; rateMedium: string }
const empty: FD = { name: "", phone: "", area: "", rateOt: "", rateMedium: "" }

export default function ShopsPage() {
  const { data: session } = useSession()
  const [rows, setRows] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [fd, setFd] = useState<FD>(empty)
  const [edit, setEdit] = useState<Shop|null>(null)
  const [ef, setEf] = useState<FD>(empty)
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState<Shop|null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const res = await fetch("/api/shops")
    if (res.ok) setRows(await res.json())
    setLoading(false)
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/shops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fd, rateOt: fd.rateOt ? parseFloat(fd.rateOt) : null, rateMedium: fd.rateMedium ? parseFloat(fd.rateMedium) : null }) })
    if (res.ok) { setShowForm(false); setFd(empty); load() }
  }

  function openEdit(r: Shop) { setEdit(r); setEf({ name: r.name, phone: r.phone ?? "", area: r.area ?? "", rateOt: r.rateOt != null ? String(r.rateOt) : "", rateMedium: r.rateMedium != null ? String(r.rateMedium) : "" }) }

  async function update(e: React.FormEvent) {
    e.preventDefault()
    if (!edit) return
    setSaving(true)
    const res = await fetch(`/api/shops/${edit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: ef.name, phone: ef.phone, area: ef.area, rateOt: ef.rateOt ? parseFloat(ef.rateOt) : null, rateMedium: ef.rateMedium ? parseFloat(ef.rateMedium) : null }) })
    if (res.ok) { setEdit(null); load() }
    setSaving(false)
  }

  async function doDelete() {
    if (!del) return
    setDeleting(true)
    const res = await fetch(`/api/shops/${del.id}`, { method: "DELETE" })
    if (res.ok) { setDel(null); load() }
    setDeleting(false)
  }

  if (loading) return <div className="p-8 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">{rows.length} outlet{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4"/>Cancel</> : <><Plus className="h-4 w-4"/>Add Shop</>}
        </Button>
      </div>

      {showForm && (
        <Card title="New Shop">
          <form onSubmit={create} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><label className="block text-sm font-medium">Name<span className="text-destructive ml-0.5">*</span></label><Input required value={fd.name} onChange={e => setFd(p => ({ ...p, name: e.target.value }))} placeholder="Shop name" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Phone</label><Input type="tel" value={fd.phone} onChange={e => setFd(p => ({ ...p, phone: e.target.value }))} placeholder="Optional" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Area</label><Input value={fd.area} onChange={e => setFd(p => ({ ...p, area: e.target.value }))} placeholder="City / area" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">OT Rate (₹/piece)</label><NumericInput step="0.01" value={fd.rateOt} onChange={v => setFd(p => ({ ...p, rateOt: v }))} placeholder="Optional" /></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium">Medium Rate (₹/piece)</label><NumericInput step="0.01" value={fd.rateMedium} onChange={v => setFd(p => ({ ...p, rateMedium: v }))} placeholder="Optional" /></div>
            </div>
            <Button type="submit" variant="gold">Save Shop</Button>
          </form>
        </Card>
      )}

      <Card title="All Shops">
        <DataTable
          columns={["Name", "Phone", "Area", "OT Rate", "Med Rate", "Status", ""]}
          rows={rows.map(r => [
            r.name, r.phone||"-", r.area||"-",
            r.rateOt ? `₹${r.rateOt}` : "-",
            r.rateMedium ? `₹${r.rateMedium}` : "-",
            <span key={r.id} className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${r.active ? "bg-emerald-50 text-emerald-700" : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground-muted))]"}`}>{r.active ? "Active" : "Inactive"}</span>,
            <div key={r.id+"a"} className="flex items-center gap-1">
              <button onClick={() => openEdit(r)} className={S.iconBtn} title="Edit"><Pencil className="h-3.5 w-3.5"/></button>
              <button onClick={() => setDel(r)} className={S.iconBtnDanger} title="Delete"><Trash2 className="h-3.5 w-3.5"/></button>
            </div>,
          ])}
        />
      </Card>

      <Dialog open={edit !== null} onClose={() => setEdit(null)} title="Edit Shop">
        <form onSubmit={update} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="block text-sm font-medium">Name<span className="text-destructive ml-0.5">*</span></label><Input required value={ef.name} onChange={e => setEf(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium">Phone</label><Input type="tel" value={ef.phone} onChange={e => setEf(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium">Area</label><Input value={ef.area} onChange={e => setEf(p => ({ ...p, area: e.target.value }))} /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium">OT Rate (₹)</label><NumericInput step="0.01" value={ef.rateOt} onChange={v => setEf(p => ({ ...p, rateOt: v }))} /></div>
            <div className="space-y-1.5"><label className="block text-sm font-medium">Medium Rate (₹)</label><NumericInput step="0.01" value={ef.rateMedium} onChange={v => setEf(p => ({ ...p, rateMedium: v }))} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button type="submit" variant="gold" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={del !== null} onClose={() => setDel(null)} title="Delete Shop" description="This action cannot be undone.">
        <p className="text-sm text-[hsl(var(--foreground-muted))] mb-5">Delete <span className="font-semibold text-foreground">{del?.name}</span>?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDel(null)}>Cancel</Button>
          <Button variant="danger" onClick={doDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button>
        </div>
      </Dialog>
    </div>
  )
}
