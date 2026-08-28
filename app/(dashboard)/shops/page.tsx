"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog } from "@/components/ui/Dialog"
import { Pencil, Trash2 } from "lucide-react"

type Shop = {
  id: string
  name: string
  phone: string | null
  area: string | null
  rateOt: number | null
  rateMedium: number | null
  active: boolean
}

type FormData = {
  name: string
  phone: string
  area: string
  rateOt: string
  rateMedium: string
}

const emptyForm: FormData = {
  name: "",
  phone: "",
  area: "",
  rateOt: "",
  rateMedium: "",
}

export default function ShopsPage() {
  const { data: session } = useSession()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const [editShop, setEditShop] = useState<Shop | null>(null)
  const [editForm, setEditForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadShops()
    }
  }, [session])

  async function loadShops() {
    try {
      const response = await fetch("/api/shops")
      if (response.ok) {
        const data = await response.json()
        setShops(data)
      }
    } catch (error) {
      console.error("Failed to load shops:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/shops", {
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
        loadShops()
      }
    } catch (error) {
      console.error("Failed to create shop:", error)
    }
  }

  function openEdit(shop: Shop) {
    setEditShop(shop)
    setEditForm({
      name: shop.name,
      phone: shop.phone ?? "",
      area: shop.area ?? "",
      rateOt: shop.rateOt != null ? String(shop.rateOt) : "",
      rateMedium: shop.rateMedium != null ? String(shop.rateMedium) : "",
    })
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editShop) return
    setSaving(true)
    try {
      const response = await fetch(`/api/shops/${editShop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          area: editForm.area,
          rateOt: editForm.rateOt ? parseFloat(editForm.rateOt) : null,
          rateMedium: editForm.rateMedium ? parseFloat(editForm.rateMedium) : null,
        }),
      })

      if (response.ok) {
        setEditShop(null)
        loadShops()
      }
    } catch (error) {
      console.error("Failed to update shop:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteShop) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/shops/${deleteShop.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setDeleteShop(null)
        loadShops()
      }
    } catch (error) {
      console.error("Failed to delete shop:", error)
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Shops</h1>
          <p className="text-muted-foreground">Manage your sales outlets</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Shop"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Shop">
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
                <label className="text-sm font-medium">Area</label>
                <Input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Enter area"
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
            <Button type="submit" variant="gold">Save Shop</Button>
          </form>
        </Card>
      )}

      <Card title="All Shops">
        <DataTable
          columns={["Name", "Phone", "Area", "OT Rate", "Medium Rate", "Status", "Actions"]}
          rows={shops.map((shop) => [
            shop.name,
            shop.phone || "-",
            shop.area || "-",
            shop.rateOt ? `Rs. ${shop.rateOt}` : "-",
            shop.rateMedium ? `Rs. ${shop.rateMedium}` : "-",
            shop.active ? "Active" : "Inactive",
            <div key={shop.id} className="flex items-center gap-2">
              <button
                onClick={() => openEdit(shop)}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteShop(shop)}
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
        open={editShop !== null}
        onClose={() => setEditShop(null)}
        title="Edit Shop"
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
              <label className="text-sm font-medium">Area</label>
              <Input
                type="text"
                value={editForm.area}
                onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                placeholder="Enter area"
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
            <Button type="button" variant="outline" onClick={() => setEditShop(null)}>
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
        open={deleteShop !== null}
        onClose={() => setDeleteShop(null)}
        title="Delete Shop"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteShop?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteShop(null)}>
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
