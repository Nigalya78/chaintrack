"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { registerSchema, type RegisterInput } from "@/lib/validations"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterInput>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registration form submitted")
    setIsLoading(true)
    setErrors({})

    try {
      console.log("Validating form data:", formData)
      const validated = registerSchema.parse(formData)
      console.log("Validation passed")
      
      console.log("Calling /api/register")
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const error = await response.text()
        console.error("Registration error:", error)
        throw new Error(error)
      }

      const result = await response.json()
      console.log("Registration success:", result)
      localStorage.setItem("setupUserId", result.userId)
      localStorage.setItem("setupBusinessId", result.businessId)
      router.push("/setup")
    } catch (error) {
      console.error("Registration failed:", error)
      if (error instanceof Error) {
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        if (error.name === "ZodError") {
          // Try to parse Zod error
          try {
            const zodError = error as any
            console.error("Zod errors:", zodError.errors)
            const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {}
            if (zodError.errors) {
              zodError.errors.forEach((err: any) => {
                const field = err.path[0] as keyof RegisterInput
                fieldErrors[field] = err.message
              })
            }
            setErrors(fieldErrors)
          } catch (e) {
            setErrors({ email: "Validation failed. Please check all fields." })
          }
        } else {
          setErrors({ email: error.message })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            Chain Track
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Chain production and inventory tracking</p>
        </div>
        <Card title="Create Your Business Account">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter business name"
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Owner Name</label>
              <Input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter owner name"
              />
              {errors.ownerName && (
                <p className="text-sm text-destructive">{errors.ownerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Create password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
