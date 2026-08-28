"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog } from "@/components/ui/Dialog"
import { Pencil, Trash2 } from "lucide-react"

type Vendor = {
  id: string
  name: string
  phone: string | null
  area: string | null
  type: "SUPPLIER" | "FINISHING"
  rateOt: number | null
  rateMedium: number | null
}

type FormData = {
  name: string
  phone: string
  area: string
  type: "SUPPLIER" | "FINISHING"
  rateOt: string
  rateMedium: string
}

const emptyForm: FormData = {
  name: "",
  phone: "",
  area: "",
  type: "SUPPLIER",
  rateOt: "",
  rateMedium: "",
}

export default function VendorsPage() {
  const { data: session } = useSession()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  const [editForm, setEditForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteVendor, setDeleteVendor] = useState<Vendor | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadVendors()
    }
  }, [session])

  async function loadVendors() {
    try {
      const response = await fetch("/api/vendors")
      if (response.ok) {
        const data = await response.json()
        setVendors(data)
      }
    } catch (error) {
      console.error("Failed to load vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/vendors", {
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
        loadVendors()
      }
    } catch (error) {
      console.error("Failed to create vendor:", error)
    }
  }

  function openEdit(vendor: Vendor) {
    setEditVendor(vendor)
    setEditForm({
      name: vendor.name,
      phone: vendor.phone ?? "",
      area: vendor.area ?? "",
      type: vendor.type,
      rateOt: vendor.rateOt != null ? String(vendor.rateOt) : "",
      rateMedium: vendor.rateMedium != null ? String(vendor.rateMedium) : "",
    })
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editVendor) return
    setSaving(true)
    try {
      const response = await fetch(`/api/vendors/${editVendor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editVendor.type,
          name: editForm.name,
          phone: editForm.phone,
          area: editForm.area,
          rateOt: editForm.rateOt ? parseFloat(editForm.rateOt) : null,
          rateMedium: editForm.rateMedium ? parseFloat(editForm.rateMedium) : null,
        }),
      })

      if (response.ok) {
        setEditVendor(null)
        loadVendors()
      }
    } catch (error) {
      console.error("Failed to update vendor:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteVendor) return
    setDeleting(true)
    try {
      const response = await fetch(
        `/api/vendors/${deleteVendor.id}?type=${deleteVendor.type}`,
        { method: "DELETE" }
      )
      if (response.ok) {
        setDeleteVendor(null)
        loadVendors()
      }
    } catch (error) {
      console.error("Failed to delete vendor:", error)
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your suppliers and finishing vendors</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Vendor"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Vendor">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "SUPPLIER" | "FINISHING" })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="SUPPLIER">Supplier</option>
                  <option value="FINISHING">Finishing Vendor</option>
                </select>
              </div>
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
              {formData.type === "FINISHING" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate per OT Chain (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rateOt}
                      onChange={(e) => setFormData({ ...formData, rateOt: e.target.value })}
                      placeholder="Enter rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate per Medium Chain (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rateMedium}
                      onChange={(e) => setFormData({ ...formData, rateMedium: e.target.value })}
                      placeholder="Enter rate"
                    />
                  </div>
                </>
              )}
            </div>
            <Button type="submit" variant="gold">Save Vendor</Button>
          </form>
        </Card>
      )}

      <Card title="All Vendors">
        <DataTable
          columns={["Type", "Name", "Phone", "Area", "Rate OT", "Rate Medium", "Actions"]}
          rows={vendors.map((vendor) => [
            vendor.type === "SUPPLIER" ? "Supplier" : "Finishing",
            vendor.name,
            vendor.phone || "-",
            vendor.area || "-",
            vendor.rateOt ? `₹${vendor.rateOt}` : "-",
            vendor.rateMedium ? `₹${vendor.rateMedium}` : "-",
            <div key={vendor.id} className="flex items-center gap-2">
              <button
                onClick={() => openEdit(vendor)}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteVendor(vendor)}
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
        open={editVendor !== null}
        onClose={() => setEditVendor(null)}
        title={`Edit ${editVendor?.type === "SUPPLIER" ? "Supplier" : "Finishing Vendor"}`}
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
            {editVendor?.type === "FINISHING" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate per OT Chain (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.rateOt}
                    onChange={(e) => setEditForm({ ...editForm, rateOt: e.target.value })}
                    placeholder="Enter rate"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate per Medium Chain (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.rateMedium}
                    onChange={(e) => setEditForm({ ...editForm, rateMedium: e.target.value })}
                    placeholder="Enter rate"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditVendor(null)}>
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
        open={deleteVendor !== null}
        onClose={() => setDeleteVendor(null)}
        title="Delete Vendor"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteVendor?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteVendor(null)}>
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
