"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog } from "@/components/ui/Dialog"
import { Pencil, Trash2 } from "lucide-react"

type Labourer = {
  id: string
  name: string
  phone: string | null
  rateOt: number | null
  rateMedium: number | null
  active: boolean
}

type FormData = {
  name: string
  phone: string
  rateOt: string
  rateMedium: string
}

const emptyForm: FormData = {
  name: "",
  phone: "",
  rateOt: "",
  rateMedium: "",
}

export default function LabourPage() {
  const { data: session } = useSession()
  const [labourers, setLabourers] = useState<Labourer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const [editLabourer, setEditLabourer] = useState<Labourer | null>(null)
  const [editForm, setEditForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteLabourer, setDeleteLabourer] = useState<Labourer | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadLabourers()
    }
  }, [session])

  async function loadLabourers() {
    try {
      const response = await fetch("/api/labourers")
      if (response.ok) {
        const data = await response.json()
        setLabourers(data)
      }
    } catch (error) {
      console.error("Failed to load labourers:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/labourers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rateOt: formData.rateOt ? parseFloat(formData.rateOt) : null,
          rateMedium: formData.rateMedium ? parseFloat(formData.rateMedium) : null,
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData(emptyForm)
        loadLabourers()
      }
    } catch (error) {
      console.error("Failed to create labourer:", error)
    }
  }

  function openEdit(labourer: Labourer) {
    setEditLabourer(labourer)
    setEditForm({
      name: labourer.name,
      phone: labourer.phone ?? "",
      rateOt: labourer.rateOt != null ? String(labourer.rateOt) : "",
      rateMedium: labourer.rateMedium != null ? String(labourer.rateMedium) : "",
    })
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editLabourer) return
    setSaving(true)
    try {
      const response = await fetch(`/api/labourers/${editLabourer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          rateOt: editForm.rateOt ? parseFloat(editForm.rateOt) : null,
          rateMedium: editForm.rateMedium ? parseFloat(editForm.rateMedium) : null,
        }),
      })

      if (response.ok) {
        setEditLabourer(null)
        loadLabourers()
      }
    } catch (error) {
      console.error("Failed to update labourer:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteLabourer) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/labourers/${deleteLabourer.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setDeleteLabourer(null)
        loadLabourers()
      }
    } catch (error) {
      console.error("Failed to delete labourer:", error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Labourers</h1>
          <p className="text-muted-foreground">Manage your labour workforce</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Labourer"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Labourer">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OT Rate (per piece)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rateOt}
                  onChange={(e) => setFormData({ ...formData, rateOt: e.target.value })}
                  placeholder="Enter OT rate"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium Rate (per piece)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rateMedium}
                  onChange={(e) => setFormData({ ...formData, rateMedium: e.target.value })}
                  placeholder="Enter Medium rate"
                />
              </div>
            </div>
            <Button type="submit" variant="gold">Save Labourer</Button>
          </form>
        </Card>
      )}

      <Card title="All Labourers">
        <DataTable
          columns={["Name", "Phone", "OT Rate", "Medium Rate", "Status", "Actions"]}
          rows={labourers.map((labourer) => [
            labourer.name,
            labourer.phone || "-",
            labourer.rateOt ? `Rs. ${labourer.rateOt}` : "-",
            labourer.rateMedium ? `Rs. ${labourer.rateMedium}` : "-",
            labourer.active ? "Active" : "Inactive",
            <div key={labourer.id} className="flex items-center gap-2">
              <button
                onClick={() => openEdit(labourer)}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteLabourer(labourer)}
                className="p-1.5 rounded hover:bg-red-100 transition-colors text-muted-foreground hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>,
          ])}
        />
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editLabourer !== null}
        onClose={() => setEditLabourer(null)}
        title="Edit Labourer"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">OT Rate (per piece)</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.rateOt}
                onChange={(e) => setEditForm({ ...editForm, rateOt: e.target.value })}
                placeholder="Enter OT rate"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Medium Rate (per piece)</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.rateMedium}
                onChange={(e) => setEditForm({ ...editForm, rateMedium: e.target.value })}
                placeholder="Enter Medium rate"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditLabourer(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteLabourer !== null}
        onClose={() => setDeleteLabourer(null)}
        title="Delete Labourer"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteLabourer?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteLabourer(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
