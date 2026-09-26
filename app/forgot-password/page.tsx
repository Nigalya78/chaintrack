"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setIsError(false)
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setMessage("If an account exists with this email, you will receive reset instructions.")
        setEmail("")
      } else {
        setIsError(true)
        setMessage("Something went wrong. Please try again.")
      }
    } catch {
      setIsError(true)
      setMessage("Something went wrong. Please try again.")
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

        {/* Card */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-border/60 bg-[hsl(214,32%,17%)]">
            <h2 className="text-[15px] font-semibold text-white">Reset your password</h2>
            <p className="text-[11px] text-[hsl(214,15%,60%)] mt-0.5">Enter your email to receive a reset link</p>
          </div>
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[hsl(214,32%,17%)]">Email</label>
                <Input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading} placeholder="you@example.com" required
                />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending…" : "Send Reset Link"}
              </Button>
              {message && (
                <p className={`text-sm text-center ${isError ? "text-destructive" : "text-emerald-600"}`}>
                  {message}
                </p>
              )}
            </form>
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
