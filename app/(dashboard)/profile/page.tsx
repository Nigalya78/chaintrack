"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { User, Building2, Mail, Phone, MapPin, Edit2, Check, X, Upload } from "lucide-react"

type BusinessData = {
  name: string
  ownerName: string
  phone: string
  logo: string | null
  address: string | null
  setupCompleted: boolean
}

type ProfileData = {
  email: string
  business: BusinessData | null
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    ownerName: "",
    phone: "",
    logo: "",
    address: "",
  })

  useEffect(() => {
    if (session?.user) {
      loadProfile()
    }
  }, [session])

  async function loadProfile() {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        if (data.business) {
          setEditForm({
            name: data.business.name,
            ownerName: data.business.ownerName,
            phone: data.business.phone,
            logo: data.business.logo || "",
            address: data.business.address || "",
          })
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: editForm,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({
          email: profile?.email || "",
          business: data.business,
        })
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    if (profile?.business) {
      setEditForm({
        name: profile.business.name,
        ownerName: profile.business.ownerName,
        phone: profile.business.phone,
        logo: profile.business.logo || "",
        address: profile.business.address || "",
      })
    }
    setIsEditing(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setEditForm({ ...editForm, logo: data.url })
      } else {
        const error = await response.json()
        alert(error.error || "Failed to upload file")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!profile) {
    return <div className="p-8">Failed to load profile</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account and business details</p>
      </div>

      {/* User Information */}
      <Card title="Account Information">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Mail className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Business Information */}
      {profile.business ? (
        <Card 
          title="Business Information"
          action={
            !isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : null
          }
        >
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Name</label>
                  <Input
                    type="text"
                    required
                    value={editForm.ownerName}
                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editForm.logo}
                        onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                        placeholder="Enter logo URL or upload file"
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    {isUploading && (
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    )}
                    {editForm.logo && (
                      <div className="mt-2">
                        <img
                          src={editForm.logo}
                          alt="Logo preview"
                          className="h-16 w-16 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Enter business address"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="gold" disabled={isSaving}>
                  <Check className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Building2 className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{profile.business.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <User className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{profile.business.ownerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Phone className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.business.phone}</p>
                </div>
              </div>
              {profile.business.address && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <MapPin className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{profile.business.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Check className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setup Status</p>
                  <p className="font-medium">
                    {profile.business.setupCompleted ? "Completed" : "Pending"}
                  </p>
                  {!profile.business.setupCompleted && (
                    <button
                      onClick={() => {
                        localStorage.setItem("fromRegistration", "false")
                        localStorage.setItem("previousPage", "/profile")
                        window.location.href = "/setup"
                      }}
                      className="text-sm text-primary hover:underline mt-1"
                    >
                      Complete your setup now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card title="Business Information">
          <p className="text-muted-foreground">No business information found. Please complete your business setup.</p>
          <Button variant="gold" className="mt-4" onClick={() => {
            localStorage.setItem("fromRegistration", "false")
            localStorage.setItem("previousPage", "/profile")
            window.location.href = "/setup"
          }}>
            Complete Setup
          </Button>
        </Card>
      )}
    </div>
  )
}
