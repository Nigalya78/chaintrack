"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { registerSchema, type RegisterInput } from "@/lib/validations"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterInput>({
    businessName: "", ownerName: "", email: "", phone: "", password: "", confirmPassword: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const [globalError, setGlobalError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    setErrors(p => ({ ...p, [name]: "" }))
    setGlobalError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true); setErrors({}); setGlobalError("")
    try {
      const validated = registerSchema.parse(formData)
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validated) })
      if (!res.ok) throw new Error(await res.text())
      const result = await res.json()
      localStorage.setItem("setupUserId", result.userId)
      localStorage.setItem("setupBusinessId", result.businessId)
      localStorage.setItem("fromRegistration", "true")
      router.push("/setup")
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        const ze = error as any
        const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {}
        ze.errors?.forEach((err: any) => { fieldErrors[err.path[0] as keyof RegisterInput] = err.message })
        setErrors(fieldErrors)
      } else {
        setGlobalError(error instanceof Error ? error.message : "Registration failed.")
      }
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ChainTrack" className="h-24 w-auto object-contain" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-5 pt-4 pb-3.5 bg-[hsl(214,32%,17%)]">
            <h2 className="text-[15px] font-semibold text-white">Create your account</h2>
            <p className="text-[11px] text-[hsl(214,15%,60%)] mt-0.5">Start tracking your business</p>
          </div>

          <div className="px-5 py-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              {globalError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">{globalError}</div>
              )}

              {/* Each field full-width on mobile — 2-col on sm+ for some pairs */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Business Name<span className="text-destructive ml-0.5">*</span></label>
                <Input type="text" name="businessName" value={formData.businessName} onChange={handleChange} disabled={isLoading} placeholder="Your business" autoComplete="organization" />
                {errors.businessName && <p className="text-xs text-destructive">{errors.businessName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Owner Name<span className="text-destructive ml-0.5">*</span></label>
                <Input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} disabled={isLoading} placeholder="Full name" autoComplete="name" />
                {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Email<span className="text-destructive ml-0.5">*</span></label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading} placeholder="you@example.com" autoComplete="email" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Phone<span className="text-destructive ml-0.5">*</span></label>
                  <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={isLoading} placeholder="+91 98765 43210" autoComplete="tel" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Password<span className="text-destructive ml-0.5">*</span></label>
                <PasswordInput name="password" value={formData.password} onChange={handleChange} disabled={isLoading} placeholder="Min. 8 characters" autoComplete="new-password" />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Confirm Password<span className="text-destructive ml-0.5">*</span></label>
                <PasswordInput name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} placeholder="Repeat password" autoComplete="new-password" />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" variant="gold" className="w-full !mt-4" disabled={isLoading}>
                {isLoading ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-[hsl(214,18%,46%)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[hsl(214,32%,17%)] hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
