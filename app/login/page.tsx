"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { loginSchema, type LoginInput } from "@/lib/validations"

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginInput>({ email: "", password: "" })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
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
    setIsLoading(true)
    setGlobalError("")
    try {
      const validated = loginSchema.parse(formData)
      const result = await signIn("credentials", {
        email: validated.email,
        password: validated.password,
        redirect: false,
      })
      if (result?.error || !result?.ok) {
        setGlobalError("Invalid email or password.")
        setIsLoading(false)
        return
      }
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Login error:", err)
      setGlobalError("Invalid email or password.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ChainTrack" className="h-28 w-auto object-contain" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-5 pt-4 pb-3.5 bg-[hsl(214,32%,17%)]">
            <h2 className="text-[15px] font-semibold text-white">Sign in to your account</h2>
          </div>

          <div className="px-5 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {globalError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  {globalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium" htmlFor="email">Email</label>
                <Input id="email" type="email" name="email" value={formData.email}
                  onChange={handleChange} disabled={isLoading} placeholder="you@example.com" autoComplete="email" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#C9922A] hover:underline underline-offset-2">
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput id="password" name="password" value={formData.password}
                  onChange={handleChange} disabled={isLoading} placeholder="••••••••" autoComplete="current-password" />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-[hsl(214,18%,46%)]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[hsl(214,32%,17%)] hover:underline underline-offset-2">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
