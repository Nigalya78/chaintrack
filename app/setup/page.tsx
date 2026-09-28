"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NumericInput } from "@/components/ui/NumericInput"
import { DataTable } from "@/components/ui/DataTable"
import { Check, ChevronRight, ChevronLeft, Trash2, Plus } from "lucide-react"

type Labourer = { name: string; phone: string; otChains: number; mediumChains: number; rateOt: number; rateMedium: number }
type Vendor   = { name: string; phone: string; area: string; otChains: number; mediumChains: number; rateOt: number; rateMedium: number }
type SetupData = {
  businessDetails: { logo?: string; address?: string }
  openingInventory: { kanniOtKg: number; kanniMediumKg: number; otChains: number; mediumChains: number; finishingOtChains: number; finishingMediumChains: number }
  labourers: Labourer[]
  vendors: Vendor[]
}

const STEP_LABELS = ["Business", "Inventory", "Labourers", "Vendors", "Review"]
const emptyL: Labourer = { name: "", phone: "", otChains: 0, mediumChains: 0, rateOt: 0, rateMedium: 0 }
const emptyV: Vendor   = { name: "", phone: "", area: "", otChains: 0, mediumChains: 0, rateOt: 0, rateMedium: 0 }
const INP = "w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm outline-none focus:border-[#C9922A] focus:ring-2 focus:ring-[#C9922A]/20 hover:border-[#C9922A]/50 transition-all"

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<SetupData>({
    businessDetails: {},
    openingInventory: { kanniOtKg: 0, kanniMediumKg: 0, otChains: 0, mediumChains: 0, finishingOtChains: 0, finishingMediumChains: 0 },
    labourers: [], vendors: [],
  })
  const [newL, setNewL] = useState<Labourer>(emptyL)
  const [newV, setNewV] = useState<Vendor>(emptyV)

  function addL() { if (!newL.name.trim()) return; setData(p => ({ ...p, labourers: [...p.labourers, { ...newL }] })); setNewL(emptyL) }
  function remL(i: number) { setData(p => ({ ...p, labourers: p.labourers.filter((_, idx) => idx !== i) })) }
  function addV() { if (!newV.name.trim()) return; setData(p => ({ ...p, vendors: [...p.vendors, { ...newV }] })); setNewV(emptyV) }
  function remV(i: number) { setData(p => ({ ...p, vendors: p.vendors.filter((_, idx) => idx !== i) })) }

  async function handleSubmit() {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("setupUserId")
      const businessId = localStorage.getItem("setupBusinessId")
      const fromReg = localStorage.getItem("fromRegistration") === "true"
      const prev = localStorage.getItem("previousPage")
      if (!userId || !businessId) { router.push("/login"); return }
      const res = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, userId, businessId, complete: true }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Setup failed") }
      localStorage.removeItem("setupUserId"); localStorage.removeItem("setupBusinessId")
      localStorage.removeItem("fromRegistration"); localStorage.removeItem("previousPage")
      router.push(fromReg ? "/login" : prev || "/dashboard")
    } catch (err) { alert(err instanceof Error ? err.message : "Setup failed.") }
    finally { setIsLoading(false) }
  }

  async function handleSkip() {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("setupUserId")
      const businessId = localStorage.getItem("setupBusinessId")
      const fromReg = localStorage.getItem("fromRegistration") === "true"
      const prev = localStorage.getItem("previousPage")
      if (fromReg) {
        if (!userId || !businessId) { router.push("/login"); return }
        await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, businessId, complete: false }) })
      }
      localStorage.removeItem("setupUserId"); localStorage.removeItem("setupBusinessId")
      localStorage.removeItem("fromRegistration"); localStorage.removeItem("previousPage")
      router.push(fromReg ? "/login" : prev || "/dashboard")
    } catch (err) { alert(err instanceof Error ? err.message : "Skip failed.") }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] px-4 py-6 sm:py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ChainTrack" className="h-20 w-auto object-contain" />
        </div>

        {/* Stepper */}
        <div className="flex items-center">
          {STEP_LABELS.map((label, idx) => {
            const s = idx + 1
            const done = s < step; const active = s === step
            return (
              <div key={s} className="flex-1 flex flex-col items-center relative">
                {idx > 0 && <div className={`absolute top-4 h-0.5 w-full -translate-y-0.5 left-[-50%] ${s <= step ? "bg-[#C9922A]" : "bg-border"}`} />}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-[#C9922A] text-white" : active ? "bg-[#C9922A] text-white ring-4 ring-[#C9922A]/20" : "bg-muted text-[hsl(var(--foreground-muted))]"}`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                <span className={`mt-1 text-[9px] font-medium hidden sm:block ${active ? "text-foreground" : "text-[hsl(var(--foreground-muted))]"}`}>{label}</span>
              </div>
            )
          })}
        </div>

        {/* Step panel */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-[hsl(214,32%,17%)] border-b border-[hsl(214,32%,22%)]">
            <h2 className="text-[14px] font-semibold text-white">Step {step}: {STEP_LABELS[step-1]}</h2>
          </div>

          <div className="px-4 sm:px-5 py-5 space-y-4">

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Optional — you can update these later from Profile.</p>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Logo URL <span className="text-[hsl(var(--foreground-muted))] font-normal text-xs">(optional)</span></label>
                  <Input type="url" placeholder="https://example.com/logo.png" value={data.businessDetails.logo || ""}
                    onChange={e => setData(p => ({ ...p, businessDetails: { ...p.businessDetails, logo: e.target.value } }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Address <span className="text-[hsl(var(--foreground-muted))] font-normal text-xs">(optional)</span></label>
                  <textarea rows={3} placeholder="Business address" value={data.businessDetails.address || ""}
                    onChange={e => setData(p => ({ ...p, businessDetails: { ...p.businessDetails, address: e.target.value } }))}
                    className={INP + " resize-none"} />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Enter current stock. Leave at 0 if starting fresh.</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-2">Kanni (Raw Material)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="block text-xs font-medium">OT Kanni (kg)</label><NumericInput step="0.001" value={data.openingInventory.kanniOtKg} onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, kanniOtKg: parseFloat(v)||0 } }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Medium Kanni (kg)</label><NumericInput step="0.001" value={data.openingInventory.kanniMediumKg} onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, kanniMediumKg: parseFloat(v)||0 } }))} /></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-2">Unfinished Chains</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="block text-xs font-medium">OT Chains</label><NumericInput allowDecimal={false} value={data.openingInventory.otChains} onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, otChains: parseInt(v)||0 } }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Medium Chains</label><NumericInput allowDecimal={false} value={data.openingInventory.mediumChains} onChange={v => setData(p => ({ ...p, openingInventory: { ...p.openingInventory, mediumChains: parseInt(v)||0 } }))} /></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Add labourers with rates and pending chains.</p>
                <div className="rounded-lg border border-border bg-[hsl(var(--muted)/0.4)] p-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Name</label><Input value={newL.name} placeholder="Labourer name" onChange={e => setNewL(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Phone</label><Input type="tel" value={newL.phone} placeholder="Optional" onChange={e => setNewL(p => ({ ...p, phone: e.target.value }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">OT Rate (₹)</label><NumericInput step="0.01" value={newL.rateOt} onChange={v => setNewL(p => ({ ...p, rateOt: parseFloat(v)||0 }))} placeholder="e.g. 2.50" /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Medium Rate (₹)</label><NumericInput step="0.01" value={newL.rateMedium} onChange={v => setNewL(p => ({ ...p, rateMedium: parseFloat(v)||0 }))} placeholder="e.g. 1.75" /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">OT Chains (pending)</label><NumericInput allowDecimal={false} value={newL.otChains} onChange={v => setNewL(p => ({ ...p, otChains: parseInt(v)||0 }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Medium Chains (pending)</label><NumericInput allowDecimal={false} value={newL.mediumChains} onChange={v => setNewL(p => ({ ...p, mediumChains: parseInt(v)||0 }))} /></div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addL}><Plus className="h-3.5 w-3.5" />Add Labourer</Button>
                </div>
                {data.labourers.length > 0 && (
                  <DataTable columns={["Name", "OT ₹", "Med ₹", "OT", "Med", ""]}
                    rows={data.labourers.map((l, i) => [l.name, l.rateOt ? `₹${l.rateOt}` : "-", l.rateMedium ? `₹${l.rateMedium}` : "-", l.otChains||"-", l.mediumChains||"-",
                      <button key={i} onClick={() => remL(i)} className="p-1 rounded text-[hsl(var(--foreground-muted))] hover:text-destructive hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>])} />
                )}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Add finishing vendors and pending chains.</p>
                <div className="rounded-lg border border-border bg-[hsl(var(--muted)/0.4)] p-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Name</label><Input value={newV.name} placeholder="Vendor name" onChange={e => setNewV(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Phone</label><Input type="tel" value={newV.phone} placeholder="Optional" onChange={e => setNewV(p => ({ ...p, phone: e.target.value }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Area</label><Input value={newV.area} placeholder="Optional" onChange={e => setNewV(p => ({ ...p, area: e.target.value }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">OT Rate (₹)</label><NumericInput step="0.01" value={newV.rateOt} onChange={v => setNewV(p => ({ ...p, rateOt: parseFloat(v)||0 }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Medium Rate (₹)</label><NumericInput step="0.01" value={newV.rateMedium} onChange={v => setNewV(p => ({ ...p, rateMedium: parseFloat(v)||0 }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">OT Chains (pending)</label><NumericInput allowDecimal={false} value={newV.otChains} onChange={v => setNewV(p => ({ ...p, otChains: parseInt(v)||0 }))} /></div>
                    <div className="space-y-1.5"><label className="block text-xs font-medium">Medium Chains (pending)</label><NumericInput allowDecimal={false} value={newV.mediumChains} onChange={v => setNewV(p => ({ ...p, mediumChains: parseInt(v)||0 }))} /></div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addV}><Plus className="h-3.5 w-3.5" />Add Vendor</Button>
                </div>
                {data.vendors.length > 0 && (
                  <DataTable columns={["Name", "OT ₹", "Med ₹", "OT", "Med", ""]}
                    rows={data.vendors.map((v, i) => [v.name, v.rateOt ? `₹${v.rateOt}` : "-", v.rateMedium ? `₹${v.rateMedium}` : "-", v.otChains||"-", v.mediumChains||"-",
                      <button key={i} onClick={() => remV(i)} className="p-1 rounded text-[hsl(var(--foreground-muted))] hover:text-destructive hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>])} />
                )}
              </div>
            )}

            {/* Step 5 — Review */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="rounded-lg bg-[hsl(38,66%,96%)] border border-[#C9922A]/30 px-4 py-3 text-sm text-[hsl(214,32%,25%)]">
                  Review below before completing setup.
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-1.5">Business</p>
                  <p className="text-sm">Logo: <span className="font-medium">{data.businessDetails.logo || "Not set"}</span></p>
                  <p className="text-sm">Address: <span className="font-medium">{data.businessDetails.address || "Not set"}</span></p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-1.5">Opening Inventory</p>
                  <DataTable columns={["Item", "Qty"]} rows={[
                    ["OT Kanni", `${data.openingInventory.kanniOtKg} kg`],
                    ["Medium Kanni", `${data.openingInventory.kanniMediumKg} kg`],
                    ["OT Chains", data.openingInventory.otChains],
                    ["Medium Chains", data.openingInventory.mediumChains],
                  ]} />
                </div>
                {data.labourers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-1.5">Labourers ({data.labourers.length})</p>
                    <DataTable columns={["Name", "OT ₹", "Med ₹"]}
                      rows={data.labourers.map(l => [l.name, l.rateOt ? `₹${l.rateOt}` : "-", l.rateMedium ? `₹${l.rateMedium}` : "-"])} />
                  </div>
                )}
                {data.vendors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-1.5">Vendors ({data.vendors.length})</p>
                    <DataTable columns={["Name", "OT ₹", "Med ₹"]}
                      rows={data.vendors.map(v => [v.name, v.rateOt ? `₹${v.rateOt}` : "-", v.rateMedium ? `₹${v.rateMedium}` : "-"])} />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pb-4">
          <Button variant="outline" size="sm" onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1 || isLoading}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} disabled={isLoading}>
              {isLoading ? "…" : "Skip"}
            </Button>
            {step < 5
              ? <Button variant="gold" size="sm" onClick={() => setStep(s => Math.min(5, s+1))}>Next <ChevronRight className="h-4 w-4" /></Button>
              : <Button variant="gold" size="sm" onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Saving…" : <><Check className="h-3.5 w-3.5" />Complete</>}</Button>
            }
          </div>
        </div>

      </div>
    </div>
  )
}
