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
    setFormData((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: "" }))
    setGlobalError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGlobalError("")

    try {
      const validated = registerSchema.parse(formData)
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      })
      if (!response.ok) {
        const msg = await response.text()
        throw new Error(msg)
      }
      const result = await response.json()
      localStorage.setItem("setupUserId", result.userId)
      localStorage.setItem("setupBusinessId", result.businessId)
      localStorage.setItem("fromRegistration", "true")
      router.push("/setup")
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        const ze = error as any
        const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {}
        ze.errors?.forEach((err: any) => {
          const field = err.path[0] as keyof RegisterInput
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setGlobalError(error instanceof Error ? error.message : "Registration failed.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4 py-10">
      <div className="w-full max-w-[440px] space-y-7">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-b from-[hsl(43,95%,56%)] to-[hsl(43,95%,44%)] shadow-[var(--shadow-md)] mb-1">
            <span className="text-xl font-black text-black">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">ChainTrack</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">Create your business account</p>
        </div>

        {/* Card */}
        <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-6 pt-6 pb-5 border-b border-border/60">
            <h2 className="text-[15px] font-semibold text-foreground">Business Registration</h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">Fill in your details to get started</p>
          </div>

          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {globalError && (
                <div className="rounded-[var(--radius)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {globalError}
                </div>
              )}

              {/* Business + Owner — 2 col on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Business Name<span className="text-destructive ml-0.5">*</span></label>
                  <Input type="text" name="businessName" value={formData.businessName} onChange={handleChange} disabled={isLoading} placeholder="Your business name" autoComplete="organization" />
                  {errors.businessName && <p className="text-xs text-destructive">{errors.businessName}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Owner Name<span className="text-destructive ml-0.5">*</span></label>
                  <Input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} disabled={isLoading} placeholder="Full name" autoComplete="name" />
                  {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName}</p>}
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Email<span className="text-destructive ml-0.5">*</span></label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading} placeholder="you@example.com" autoComplete="email" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Phone<span className="text-destructive ml-0.5">*</span></label>
                  <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={isLoading} placeholder="+91 98765 43210" autoComplete="tel" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Password<span className="text-destructive ml-0.5">*</span></label>
                  <PasswordInput name="password" value={formData.password} onChange={handleChange} disabled={isLoading} placeholder="Min. 8 characters" autoComplete="new-password" />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Confirm Password<span className="text-destructive ml-0.5">*</span></label>
                  <PasswordInput name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} placeholder="Repeat password" autoComplete="new-password" />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button type="submit" variant="gold" className="w-full mt-1" disabled={isLoading}>
                {isLoading ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-[hsl(var(--foreground-muted))]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
