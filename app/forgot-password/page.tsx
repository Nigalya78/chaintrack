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

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, newPassword: formData.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong.")
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-[400px] space-y-8">

        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ChainTrack" width={200} height={160} className="object-contain" />
        </div>

        <div className="bg-white rounded-[var(--radius-xl)] border border-[hsl(38,20%,86%)] shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-[hsl(38,20%,90%)] bg-[hsl(214,32%,14%)]">
            <h2 className="text-[15px] font-semibold text-white">Reset Password</h2>
            <p className="text-[11px] text-[hsl(214,15%,60%)] mt-0.5">Enter your email and set a new password</p>
          </div>

          <div className="px-6 py-6">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">Password updated successfully!</p>
                <p className="text-sm text-[hsl(214,18%,46%)]">You can now sign in with your new password.</p>
                <Link href="/login">
                  <Button variant="gold" className="w-full mt-2">Go to Sign In</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-[var(--radius)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[hsl(214,32%,17%)]">Email</label>
                  <Input
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[hsl(214,32%,17%)]">New Password</label>
                  <PasswordInput
                    required
                    value={formData.newPassword}
                    onChange={e => setFormData(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min. 8 characters"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[hsl(214,32%,17%)]">Confirm New Password</label>
                  <PasswordInput
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating…" : "Update Password"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[hsl(214,18%,46%)]">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[hsl(214,32%,17%)] hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
