"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NumericInput } from "@/components/ui/NumericInput"
import { DataTable } from "@/components/ui/DataTable"
import { Check, ChevronRight, ChevronLeft, Trash2, Plus } from "lucide-react"

/* ── Types ───────────────────────────────────────────────── */
type Labourer = { name: string; phone: string; otChains: number; mediumChains: number; rateOt: number; rateMedium: number }
type Vendor   = { name: string; phone: string; area: string; otChains: number; mediumChains: number; rateOt: number; rateMedium: number }
type SetupData = {
  businessDetails: { logo?: string; address?: string }
  openingInventory: { kanniOtKg: number; kanniMediumKg: number; otChains: number; mediumChains: number; finishingOtChains: number; finishingMediumChains: number }
  labourers: Labourer[]
  vendors: Vendor[]
}

const STEP_LABELS = ["Business", "Inventory", "Labourers", "Vendors", "Review"]
const emptyLabourer: Labourer = { name: "", phone: "", otChains: 0, mediumChains: 0, rateOt: 0, rateMedium: 0 }
const emptyVendor: Vendor     = { name: "", phone: "", area: "", otChains: 0, mediumChains: 0, rateOt: 0, rateMedium: 0 }

/* ── Shared input class ──────────────────────────────────── */
const INP = "w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-border bg-[hsl(var(--surface))] text-sm text-foreground placeholder:text-[hsl(var(--foreground-muted))] outline-none transition-all duration-150 hover:border-[hsl(var(--border-strong))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)]"

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<SetupData>({
    businessDetails: {},
    openingInventory: { kanniOtKg: 0, kanniMediumKg: 0, otChains: 0, mediumChains: 0, finishingOtChains: 0, finishingMediumChains: 0 },
    labourers: [],
    vendors: [],
  })
  const [newLabourer, setNewLabourer] = useState<Labourer>(emptyLabourer)
  const [newVendor, setNewVendor]     = useState<Vendor>(emptyVendor)

  /* ── Helpers ─────────────────────────────────────────────── */
  function addLabourer() {
    if (!newLabourer.name.trim()) return
    setData(p => ({ ...p, labourers: [...p.labourers, { ...newLabourer }] }))
    setNewLabourer(emptyLabourer)
  }
  function removeLabourer(i: number) { setData(p => ({ ...p, labourers: p.labourers.filter((_, idx) => idx !== i) })) }
  function addVendor() {
    if (!newVendor.name.trim()) return
    setData(p => ({ ...p, vendors: [...p.vendors, { ...newVendor }] }))
    setNewVendor(emptyVendor)
  }
  function removeVendor(i: number) { setData(p => ({ ...p, vendors: p.vendors.filter((_, idx) => idx !== i) })) }

  async function handleSubmit() {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("setupUserId")
      const businessId = localStorage.getItem("setupBusinessId")
      const fromRegistration = localStorage.getItem("fromRegistration") === "true"
      const previousPage = localStorage.getItem("previousPage")
      if (!userId || !businessId) { router.push("/login"); return }
      const res = await fetch("/api/setup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId, businessId, complete: true }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Setup failed") }
      localStorage.removeItem("setupUserId"); localStorage.removeItem("setupBusinessId")
      localStorage.removeItem("fromRegistration"); localStorage.removeItem("previousPage")
      router.push(fromRegistration ? "/login" : previousPage || "/dashboard")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Setup failed. Please try again.")
    } finally { setIsLoading(false) }
  }

  async function handleSkip() {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("setupUserId")
      const businessId = localStorage.getItem("setupBusinessId")
      const fromRegistration = localStorage.getItem("fromRegistration") === "true"
      const previousPage = localStorage.getItem("previousPage")
      if (fromRegistration) {
        if (!userId || !businessId) { router.push("/login"); return }
        const res = await fetch("/api/setup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, businessId, complete: false }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Skip failed") }
      }
      localStorage.removeItem("setupUserId"); localStorage.removeItem("setupBusinessId")
      localStorage.removeItem("fromRegistration"); localStorage.removeItem("previousPage")
      router.push(fromRegistration ? "/login" : previousPage || "/dashboard")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Skip failed.")
    } finally { setIsLoading(false) }
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="text-center space-y-1 pt-2">
          <div className="flex justify-center mb-4">
            <div className="relative w-44 h-44">
              <Image src="/logo.png" alt="ChainTrack" fill className="object-contain" priority />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(214,32%,17%)]">Business Setup</h1>
          <p className="text-sm text-[hsl(214,18%,46%)]">Get your account ready in 5 quick steps</p>
        </div>

        {/* ── Progress stepper ── */}
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((label, idx) => {
            const s = idx + 1
            const done   = s < step
            const active = s === step
            return (
              <div key={s} className="flex-1 flex flex-col items-center relative">
                {/* connector line */}
                {idx > 0 && (
                  <div className={`absolute left-0 top-4 h-0.5 w-full -translate-y-0.5 ${s <= step ? "bg-[hsl(var(--primary))]" : "bg-border"}`} style={{ left: "-50%", width: "100%" }} />
                )}
                {/* circle */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  done   ? "bg-[hsl(var(--primary))] text-black"  :
                  active ? "bg-[hsl(var(--primary))] text-black ring-4 ring-[hsl(43,95%,50%/0.25)]" :
                           "bg-[hsl(var(--muted))] text-[hsl(var(--foreground-muted))]"
                }`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                <span className={`mt-1.5 text-[10px] font-medium hidden sm:block ${active ? "text-foreground" : "text-[hsl(var(--foreground-muted))]"}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Step panels ── */}
        <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-sm)] overflow-hidden">

          {/* Step header — navy bar */}
          <div className="px-6 py-4 border-b border-[hsl(38,20%,88%)] bg-[hsl(214,32%,17%)]">
            <h2 className="font-semibold text-[15px] text-white">
              Step {step}: {STEP_LABELS[step - 1]}
            </h2>
          </div>

          <div className="px-6 py-6">

            {/* ── Step 1: Business Details ── */}
            {step === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Optional details — you can update these later from Profile.</p>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Logo URL <span className="text-[hsl(var(--foreground-muted))] font-normal">(optional)</span></label>
                  <Input type="url" placeholder="https://example.com/logo.png"
                    value={data.businessDetails.logo || ""}
                    onChange={e => setData(p => ({ ...p, businessDetails: { ...p.businessDetails, logo: e.target.value } }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Address <span className="text-[hsl(var(--foreground-muted))] font-normal">(optional)</span></label>
                  <textarea
                    rows={3}
                    placeholder="Business address"
                    value={data.businessDetails.address || ""}
                    onChange={e => setData(p => ({ ...p, businessDetails: { ...p.businessDetails, address: e.target.value } }))}
                    className={INP + " resize-none"}
                  />
                </div>
              </div>
            )}

            {/* ── Step 2: Opening Inventory ── */}
            {step === 2 && (
              <div className="space-y-5">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Enter your current stock levels. Leave at 0 if you&apos;re starting fresh.</p>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Kanni (Raw Material)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">OT Kanni (kg)</label>
                      <NumericInput step="0.001" value={data.openingInventory.kanniOtKg}
                        onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, kanniOtKg: parseFloat(v) || 0 } }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Medium Kanni (kg)</label>
                      <NumericInput step="0.001" value={data.openingInventory.kanniMediumKg}
                        onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, kanniMediumKg: parseFloat(v) || 0 } }))} />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Unfinished Chains</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">OT Chains</label>
                      <NumericInput allowDecimal={false} value={data.openingInventory.otChains}
                        onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, otChains: parseInt(v) || 0 } }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Medium Chains</label>
                      <NumericInput allowDecimal={false} value={data.openingInventory.mediumChains}
                        onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, mediumChains: parseInt(v) || 0 } }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Labourers ── */}
            {step === 3 && (
              <div className="space-y-5">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Add your labourers with their rates and any chains they currently hold.</p>
                <div className="rounded-[var(--radius)] border border-border bg-[hsl(var(--muted)/0.3)] p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Name</label>
                      <Input value={newLabourer.name} placeholder="Labourer name"
                        onChange={e => setNewLabourer(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Phone</label>
                      <Input type="tel" value={newLabourer.phone} placeholder="Optional"
                        onChange={e => setNewLabourer(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">OT Rate (₹/piece)</label>
                      <NumericInput step="0.01" value={newLabourer.rateOt} placeholder="e.g. 2.50"
                        onChange={v => setNewLabourer(p => ({ ...p, rateOt: parseFloat(v) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Medium Rate (₹/piece)</label>
                      <NumericInput step="0.01" value={newLabourer.rateMedium} placeholder="e.g. 1.75"
                        onChange={v => setNewLabourer(p => ({ ...p, rateMedium: parseFloat(v) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">OT Chains (pending)</label>
                      <NumericInput allowDecimal={false} value={newLabourer.otChains}
                        onChange={v => setNewLabourer(p => ({ ...p, otChains: parseInt(v) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Medium Chains (pending)</label>
                      <NumericInput allowDecimal={false} value={newLabourer.mediumChains}
                        onChange={v => setNewLabourer(p => ({ ...p, mediumChains: parseInt(v) || 0 }))} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addLabourer}>
                    <Plus className="h-3.5 w-3.5" /> Add Labourer
                  </Button>
                </div>
                {data.labourers.length > 0 && (
                  <DataTable
                    columns={["Name", "OT Rate", "Med Rate", "OT Chains", "Med Chains", ""]}
                    rows={data.labourers.map((l, i) => [
                      l.name,
                      l.rateOt ? `₹${l.rateOt}` : "-",
                      l.rateMedium ? `₹${l.rateMedium}` : "-",
                      l.otChains || "-",
                      l.mediumChains || "-",
                      <button key={i} onClick={() => removeLabourer(i)} className="p-1 rounded text-[hsl(var(--foreground-muted))] hover:text-destructive hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>,
                    ])}
                  />
                )}
              </div>
            )}

            {/* ── Step 4: Finishing Vendors ── */}
            {step === 4 && (
              <div className="space-y-5">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Add finishing vendors and their current pending chains.</p>
                <div className="rounded-[var(--radius)] border border-border bg-[hsl(var(--muted)/0.3)] p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Vendor Name</label>
                      <Input value={newVendor.name} placeholder="Vendor name"
                        onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Phone</label>
                      <Input type="tel" value={newVendor.phone} placeholder="Optional"
                        onChange={e => setNewVendor(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Area</label>
                      <Input value={newVendor.area} placeholder="Optional"
                        onChange={e => setNewVendor(p => ({ ...p, area: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Rate OT (₹/piece)</label>
                      <NumericInput step="0.01" value={newVendor.rateOt}
                        onChange={v => setNewVendor(p => ({ ...p, rateOt: parseFloat(v) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Rate Medium (₹/piece)</label>
                      <NumericInput step="0.01" value={newVendor.rateMedium}
                        onChange={v => setNewVendor(p => ({ ...p, rateMedium: parseFloat(v) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">OT Chains (pending)</label>
                      <NumericInput allowDecimal={false} value={newVendor.otChains}
                        onChange={v => setNewVendor(p => ({ ...p, otChains: parseInt(v) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Medium Chains (pending)</label>
                      <NumericInput allowDecimal={false} value={newVendor.mediumChains}
                        onChange={v => setNewVendor(p => ({ ...p, mediumChains: parseInt(v) || 0 }))} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addVendor}>
                    <Plus className="h-3.5 w-3.5" /> Add Vendor
                  </Button>
                </div>
                {data.vendors.length > 0 && (
                  <DataTable
                    columns={["Name", "Rate OT", "Rate Med", "OT Chains", "Med Chains", ""]}
                    rows={data.vendors.map((v, i) => [
                      v.name,
                      v.rateOt ? `₹${v.rateOt}` : "-",
                      v.rateMedium ? `₹${v.rateMedium}` : "-",
                      v.otChains || "-",
                      v.mediumChains || "-",
                      <button key={i} onClick={() => removeVendor(i)} className="p-1 rounded text-[hsl(var(--foreground-muted))] hover:text-destructive hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>,
                    ])}
                  />
                )}
              </div>
            )}

            {/* ── Step 5: Review ── */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="rounded-[var(--radius)] bg-[hsl(43,95%,96%)] border border-[hsl(43,80%,80%)] px-4 py-3 text-sm text-[hsl(43,50%,30%)]">
                  Review everything below before completing setup. You can go back to make changes.
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Business Details</p>
                  <p className="text-sm">Logo: <span className="font-medium">{data.businessDetails.logo || "Not provided"}</span></p>
                  <p className="text-sm">Address: <span className="font-medium">{data.businessDetails.address || "Not provided"}</span></p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Opening Inventory</p>
                  <DataTable columns={["Item", "Quantity"]} rows={[
                    ["OT Kanni",      `${data.openingInventory.kanniOtKg} kg`],
                    ["Medium Kanni",  `${data.openingInventory.kanniMediumKg} kg`],
                    ["OT Chains",     data.openingInventory.otChains],
                    ["Medium Chains", data.openingInventory.mediumChains],
                  ]} />
                </div>
                {data.labourers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Labourers ({data.labourers.length})</p>
                    <DataTable columns={["Name", "OT Rate", "Med Rate", "OT", "Med"]}
                      rows={data.labourers.map(l => [l.name, l.rateOt ? `₹${l.rateOt}` : "-", l.rateMedium ? `₹${l.rateMedium}` : "-", l.otChains || 0, l.mediumChains || 0])} />
                  </div>
                )}
                {data.vendors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))]">Finishing Vendors ({data.vendors.length})</p>
                    <DataTable columns={["Name", "Rate OT", "Rate Med"]}
                      rows={data.vendors.map(v => [v.name, v.rateOt ? `₹${v.rateOt}` : "-", v.rateMedium ? `₹${v.rateMedium}` : "-"])} />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || isLoading}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} disabled={isLoading}>
              {isLoading ? "Skipping…" : "Skip for now"}
            </Button>
            {step < 5 ? (
              <Button variant="gold" onClick={() => setStep(s => Math.min(5, s + 1))}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="gold" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving…" : <><Check className="h-4 w-4" /> Complete Setup</>}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
