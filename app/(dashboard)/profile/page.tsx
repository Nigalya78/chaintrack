"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Building2, Mail, Phone, MapPin, User, Pencil, Check, X, Upload, ExternalLink } from "lucide-react"

type Business = { name: string; ownerName: string; phone: string; logo: string|null; address: string|null; setupCompleted: boolean }
type Profile  = { email: string; business: Business|null }

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="shrink-0 p-2 rounded-[var(--radius-sm)] bg-[hsl(43,95%,94%)] text-[hsl(43,70%,40%)] mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-[hsl(var(--foreground-muted))] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile|null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [ef, setEf] = useState({ name: "", ownerName: "", phone: "", logo: "", address: "" })

  useEffect(() => { if (session?.user) load() }, [session])

  async function load() {
    const res = await fetch("/api/profile")
    if (res.ok) {
      const d: Profile = await res.json()
      setProfile(d)
      if (d.business) setEf({ name: d.business.name, ownerName: d.business.ownerName, phone: d.business.phone, logo: d.business.logo || "", address: d.business.address || "" })
    }
    setLoading(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business: ef }) })
    if (res.ok) { const d = await res.json(); setProfile(p => p ? { ...p, business: d.business } : p); setEditing(false) }
    setSaving(false)
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: form })
    if (res.ok) { const d = await res.json(); setEf(p => ({ ...p, logo: d.url })) }
    else alert("Upload failed")
    setUploading(false)
  }

  function cancel() {
    if (profile?.business) setEf({ name: profile.business.name, ownerName: profile.business.ownerName, phone: profile.business.phone, logo: profile.business.logo || "", address: profile.business.address || "" })
    setEditing(false)
  }

  if (loading) return <div className="p-8 text-sm text-[hsl(var(--foreground-muted))] animate-pulse">Loading…</div>
  if (!profile) return <div className="p-8 text-sm text-[hsl(var(--foreground-muted))]">Failed to load profile.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">Your account and business details</p>
      </div>

      {/* Account card */}
      <Card title="Account">
        <div className="py-1">
          <InfoRow icon={<Mail className="h-3.5 w-3.5"/>} label="Email" value={profile.email} />
        </div>
      </Card>

      {/* Business card */}
      {profile.business ? (
        <Card
          title="Business"
          action={!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          ) : undefined}
        >
          {editing ? (
            <form onSubmit={save} className="space-y-4 pt-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><label className="block text-sm font-medium">Business Name<span className="text-destructive ml-0.5">*</span></label><Input required value={ef.name} onChange={e => setEf(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-1.5"><label className="block text-sm font-medium">Owner Name<span className="text-destructive ml-0.5">*</span></label><Input required value={ef.ownerName} onChange={e => setEf(p => ({ ...p, ownerName: e.target.value }))} /></div>
                <div className="space-y-1.5"><label className="block text-sm font-medium">Phone<span className="text-destructive ml-0.5">*</span></label><Input type="tel" required value={ef.phone} onChange={e => setEf(p => ({ ...p, phone: e.target.value }))} /></div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-medium">Logo</label>
                  <div className="flex gap-2">
                    <Input value={ef.logo} onChange={e => setEf(p => ({ ...p, logo: e.target.value }))} placeholder="URL or upload a file" className="flex-1" />
                    <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius)] border border-border text-sm font-medium cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors whitespace-nowrap">
                      <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
                      <input type="file" accept="image/*" onChange={upload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                  {ef.logo && <img src={ef.logo} alt="Logo" className="mt-2 h-14 w-14 object-contain rounded-[var(--radius)] border border-border" />}
                </div>
                <div className="space-y-1.5 sm:col-span-2"><label className="block text-sm font-medium">Address</label><Input value={ef.address} onChange={e => setEf(p => ({ ...p, address: e.target.value }))} placeholder="Business address" /></div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" variant="gold" disabled={saving}><Check className="h-4 w-4"/>{saving ? "Saving…" : "Save Changes"}</Button>
                <Button type="button" variant="outline" onClick={cancel}><X className="h-4 w-4"/>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="pt-1">
              {profile.business.logo && (
                <div className="mb-4">
                  <img src={profile.business.logo} alt="Logo" className="h-14 w-14 object-contain rounded-[var(--radius)] border border-border" />
                </div>
              )}
              <InfoRow icon={<Building2 className="h-3.5 w-3.5"/>} label="Business Name" value={profile.business.name} />
              <InfoRow icon={<User className="h-3.5 w-3.5"/>} label="Owner" value={profile.business.ownerName} />
              <InfoRow icon={<Phone className="h-3.5 w-3.5"/>} label="Phone" value={profile.business.phone} />
              {profile.business.address && <InfoRow icon={<MapPin className="h-3.5 w-3.5"/>} label="Address" value={profile.business.address} />}
              <div className="flex items-start gap-3 py-3">
                <div className="shrink-0 p-2 rounded-[var(--radius-sm)] bg-[hsl(43,95%,94%)] text-[hsl(43,70%,40%)] mt-0.5"><Check className="h-3.5 w-3.5"/></div>
                <div>
                  <p className="text-xs text-[hsl(var(--foreground-muted))] font-medium uppercase tracking-wide">Setup Status</p>
                  <p className="text-sm font-medium mt-0.5">
                    {profile.business.setupCompleted
                      ? <span className="text-emerald-600">Completed</span>
                      : <span className="text-amber-600">Pending — <button onClick={() => { localStorage.setItem("fromRegistration","false"); localStorage.setItem("previousPage","/profile"); window.location.href="/setup" }} className="underline underline-offset-2">Complete setup now</button></span>
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card title="Business">
          <p className="text-sm text-[hsl(var(--foreground-muted))] py-2">No business info found.</p>
          <Button variant="gold" className="mt-3" onClick={() => { localStorage.setItem("fromRegistration","false"); localStorage.setItem("previousPage","/profile"); window.location.href="/setup" }}>
            <ExternalLink className="h-4 w-4" /> Complete Setup
          </Button>
        </Card>
      )}
    </div>
  )
}
