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
    setFormData((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: "" }))
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
      if (result?.error) {
        setGlobalError("Invalid email or password.")
        setIsLoading(false)
        return
      }
      window.location.href = "/dashboard"
    } catch {
      setGlobalError("Invalid email or password.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-[400px] space-y-8">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-b from-[hsl(43,95%,56%)] to-[hsl(43,95%,44%)] shadow-[var(--shadow-md)] mb-1">
            <span className="text-xl font-black text-black">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">ChainTrack</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">Chain production &amp; inventory management</p>
        </div>

        {/* Card */}
        <div className="bg-[hsl(var(--surface))] rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-6 pb-5 border-b border-border/60">
            <h2 className="text-[15px] font-semibold text-foreground">Sign in to your account</h2>
          </div>

          {/* Form */}
          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {globalError && (
                <div className="rounded-[var(--radius)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {globalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground" htmlFor="password">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[hsl(var(--primary))] hover:underline underline-offset-2">
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" variant="gold" className="w-full mt-1" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[hsl(var(--foreground-muted))]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline underline-offset-2">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
