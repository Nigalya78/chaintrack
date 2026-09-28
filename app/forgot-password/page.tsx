"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({ email: "", newPassword: "", confirmPassword: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (formData.newPassword !== formData.confirmPassword) { setError("Passwords do not match."); return }
    if (formData.newPassword.length < 8) { setError("Password must be at least 8 characters."); return }
    setIsLoading(true)
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, newPassword: formData.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Something went wrong.")
      else setSuccess(true)
    } catch { setError("Something went wrong.") }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ChainTrack" className="h-20 w-auto max-w-[160px] object-contain" />
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-5 pt-4 pb-3.5 bg-[hsl(214,32%,17%)]">
            <h2 className="text-[15px] font-semibold text-white">Reset Password</h2>
            <p className="text-[11px] text-[hsl(214,15%,60%)] mt-0.5">Enter your email and set a new password</p>
          </div>

          <div className="px-5 py-5">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Password updated!</p>
                <p className="text-xs text-[hsl(214,18%,46%)]">You can now sign in with your new password.</p>
                <Link href="/login">
                  <Button variant="gold" className="w-full">Go to Sign In</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">{error}</div>}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Email</label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">New Password</label>
                  <PasswordInput required value={formData.newPassword} onChange={e => setFormData(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 8 characters" disabled={isLoading} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Confirm Password</label>
                  <PasswordInput required value={formData.confirmPassword} onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat password" disabled={isLoading} />
                </div>
                <Button type="submit" variant="gold" className="w-full !mt-4" disabled={isLoading}>
                  {isLoading ? "Updating…" : "Update Password"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[hsl(214,18%,46%)]">
          Remember it?{" "}
          <Link href="/login" className="font-semibold text-[hsl(214,32%,17%)] hover:underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
