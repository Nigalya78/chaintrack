"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { DataTable } from "@/components/ui/DataTable"
import { Input } from "@/components/ui/Input"

type Labourer = {
  name: string
  phone: string
  otChains: number
  mediumChains: number
}

type Vendor = {
  name: string
  phone: string
  area: string
  otChains: number
  mediumChains: number
  rateOt: number
  rateMedium: number
}

type SetupData = {
  businessDetails: {
    logo?: string
    address?: string
  }
  openingInventory: {
    kanniOtKg: number
    kanniMediumKg: number
    otChains: number
    mediumChains: number
    finishingOtChains: number
    finishingMediumChains: number
  }
  labourers: Labourer[]
  vendors: Vendor[]
}

export default function SetupPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [data, setData] = useState<SetupData>({
    businessDetails: {},
    openingInventory: {
      kanniOtKg: 0,
      kanniMediumKg: 0,
      otChains: 0,
      mediumChains: 0,
      finishingOtChains: 0,
      finishingMediumChains: 0,
    },
    labourers: [],
    vendors: [],
  })

  const [newLabourer, setNewLabourer] = useState<Labourer>({
    name: "",
    phone: "",
    otChains: 0,
    mediumChains: 0,
  })

  const [newVendor, setNewVendor] = useState<Vendor>({
    name: "",
    phone: "",
    area: "",
    otChains: 0,
    mediumChains: 0,
    rateOt: 0,
    rateMedium: 0,
  })

  const addLabourer = () => {
    if (newLabourer.name) {
      setData((prev) => ({
        ...prev,
        labourers: [...prev.labourers, { ...newLabourer }],
      }))
      setNewLabourer({ name: "", phone: "", otChains: 0, mediumChains: 0 })
    }
  }

  const removeLabourer = (index: number) => {
    setData((prev) => ({
      ...prev,
      labourers: prev.labourers.filter((_, i) => i !== index),
    }))
  }

  const addVendor = () => {
    if (newVendor.name) {
      setData((prev) => ({
        ...prev,
        vendors: [...prev.vendors, { ...newVendor }],
      }))
      setNewVendor({ name: "", phone: "", area: "", otChains: 0, mediumChains: 0, rateOt: 0, rateMedium: 0 })
    }
  }

  const removeVendor = (index: number) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("setupUserId")
      const businessId = localStorage.getItem("setupBusinessId")
      const fromRegistration = localStorage.getItem("fromRegistration") === "true"
      const previousPage = localStorage.getItem("previousPage")

      if (!userId || !businessId) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId, businessId, complete: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Setup failed")
      }

      localStorage.removeItem("setupUserId")
      localStorage.removeItem("setupBusinessId")
      localStorage.removeItem("fromRegistration")
      localStorage.removeItem("previousPage")
      
      // If coming from registration, redirect to login
      // Otherwise, go to the previous page or dashboard
      if (fromRegistration) {
        router.push("/login")
      } else if (previousPage) {
        router.push(previousPage)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Setup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("setupUserId")
      const businessId = localStorage.getItem("setupBusinessId")
      const fromRegistration = localStorage.getItem("fromRegistration") === "true"
      const previousPage = localStorage.getItem("previousPage")


      // If coming from registration, we need userId/businessId
      // If already logged in (from dashboard/profile), just skip without API call
      if (fromRegistration) {
        if (!userId || !businessId) {
          router.push("/login")
          return
        }

        const response = await fetch("/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, businessId, complete: false }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Skip failed")
        }

        localStorage.removeItem("setupUserId")
        localStorage.removeItem("setupBusinessId")
        localStorage.removeItem("fromRegistration")
        localStorage.removeItem("previousPage")
        
        router.push("/login")
      } else {
        // Already logged in user - just go back to previous page or dashboard
        localStorage.removeItem("setupUserId")
        localStorage.removeItem("setupBusinessId")
        localStorage.removeItem("fromRegistration")
        localStorage.removeItem("previousPage")
        
        if (previousPage) {
          router.push(previousPage)
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Skip failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Business Setup</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Complete your business setup in 5 steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full mx-1 ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Business Details */}
        {step === 1 && (
          <Card title="Step 1: Business Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Logo (Optional)</label>
                <input
                  type="text"
                  placeholder="Logo URL"
                  value={data.businessDetails.logo || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      businessDetails: {
                        ...prev.businessDetails,
                        logo: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address (Optional)</label>
                <textarea
                  placeholder="Business address"
                  value={data.businessDetails.address || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      businessDetails: {
                        ...prev.businessDetails,
                        address: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Opening Inventory */}
        {step === 2 && (
          <Card title="Step 2: Opening Inventory">
            <p className="text-sm text-muted-foreground mb-4">
              Enter your current inventory levels
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">OT Kanni (kg)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={data.openingInventory.kanniOtKg}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        openingInventory: {
                          ...prev.openingInventory,
                          kanniOtKg: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medium Kanni (kg)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={data.openingInventory.kanniMediumKg}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        openingInventory: {
                          ...prev.openingInventory,
                          kanniMediumKg: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">OT Chains</label>
                  <input
                    type="number"
                    value={data.openingInventory.otChains}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        openingInventory: {
                          ...prev.openingInventory,
                          otChains: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medium Chains</label>
                  <input
                    type="number"
                    value={data.openingInventory.mediumChains}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        openingInventory: {
                          ...prev.openingInventory,
                          mediumChains: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Labourers */}
        {step === 3 && (
          <Card title="Step 3: Labourers">
            <p className="text-sm text-muted-foreground mb-4">
              Add labourers and their current pending chains
            </p>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={newLabourer.name}
                    onChange={(e) =>
                      setNewLabourer((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newLabourer.phone}
                    onChange={(e) =>
                      setNewLabourer((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">OT Chains</label>
                  <input
                    type="number"
                    value={newLabourer.otChains}
                    onChange={(e) =>
                      setNewLabourer((prev) => ({
                        ...prev,
                        otChains: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medium Chains</label>
                  <input
                    type="number"
                    value={newLabourer.mediumChains}
                    onChange={(e) =>
                      setNewLabourer((prev) => ({
                        ...prev,
                        mediumChains: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <Button onClick={addLabourer}>Add Labourer</Button>
            </div>

            {data.labourers.length > 0 && (
              <DataTable
                columns={["Name", "Phone", "OT Chains", "Medium Chains", "Action"]}
                rows={data.labourers.map((labourer, index) => [
                  labourer.name,
                  labourer.phone || "-",
                  labourer.otChains,
                  labourer.mediumChains,
                  <button
                    key={index}
                    onClick={() => removeLabourer(index)}
                    className="text-destructive hover:underline"
                  >
                    Remove
                  </button>,
                ])}
              />
            )}
          </Card>
        )}

        {/* Step 4: Finishing Vendors */}
        {step === 4 && (
          <Card title="Step 4: Finishing Vendors">
            <p className="text-sm text-muted-foreground mb-4">
              Add finishing vendors and their current pending chains
            </p>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vendor Name</label>
                  <input
                    type="text"
                    value={newVendor.name}
                    onChange={(e) =>
                      setNewVendor((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    value={newVendor.phone}
                    onChange={(e) =>
                      setNewVendor((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Area</label>
                  <input
                    type="text"
                    value={newVendor.area}
                    onChange={(e) =>
                      setNewVendor((prev) => ({ ...prev, area: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">OT Chains</label>
                  <input
                    type="number"
                    value={newVendor.otChains}
                    onChange={(e) =>
                      setNewVendor((prev) => ({
                        ...prev,
                        otChains: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medium Chains</label>
                  <input
                    type="number"
                    value={newVendor.mediumChains}
                    onChange={(e) =>
                      setNewVendor((prev) => ({
                        ...prev,
                        mediumChains: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate OT (₹/piece)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVendor.rateOt}
                    onChange={(e) =>
                      setNewVendor((prev) => ({
                        ...prev,
                        rateOt: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate Medium (₹/piece)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVendor.rateMedium}
                    onChange={(e) =>
                      setNewVendor((prev) => ({
                        ...prev,
                        rateMedium: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <Button onClick={addVendor}>Add Vendor</Button>
            </div>

            {data.vendors.length > 0 && (
              <DataTable
                columns={["Name", "Phone", "Area", "OT Chains", "Medium Chains", "Rate OT", "Rate Medium", "Action"]}
                rows={data.vendors.map((vendor, index) => [
                  vendor.name,
                  vendor.phone || "-",
                  vendor.area || "-",
                  vendor.otChains,
                  vendor.mediumChains,
                  vendor.rateOt ? `₹${vendor.rateOt}` : "-",
                  vendor.rateMedium ? `₹${vendor.rateMedium}` : "-",
                  <button
                    key={index}
                    onClick={() => removeVendor(index)}
                    className="text-destructive hover:underline"
                  >
                    Remove
                  </button>,
                ])}
              />
            )}
          </Card>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <Card title="Step 5: Review & Finish">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Business Details</h3>
                <p className="text-sm text-muted-foreground">
                  Logo: {data.businessDetails.logo || "Not provided"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Address: {data.businessDetails.address || "Not provided"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Opening Inventory</h3>
                <DataTable
                  columns={["Type", "Quantity"]}
                  rows={[
                    ["OT Kanni", `${data.openingInventory.kanniOtKg} kg`],
                    ["Medium Kanni", `${data.openingInventory.kanniMediumKg} kg`],
                    ["OT Chains", data.openingInventory.otChains],
                    ["Medium Chains", data.openingInventory.mediumChains],
                  ]}
                />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Labourers ({data.labourers.length})</h3>
                {data.labourers.length > 0 ? (
                  <DataTable
                    columns={["Name", "Phone", "OT Chains", "Medium Chains"]}
                    rows={data.labourers.map((labourer) => [
                      labourer.name,
                      labourer.phone || "-",
                      labourer.otChains,
                      labourer.mediumChains,
                    ])}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No labourers added</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Finishing Vendors ({data.vendors.length})</h3>
                {data.vendors.length > 0 ? (
                  <DataTable
                    columns={["Name", "OT Chains", "Medium Chains"]}
                    rows={data.vendors.map((vendor) => [
                      vendor.name,
                      vendor.otChains,
                      vendor.mediumChains,
                    ])}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No vendors added</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={step === 1 || isLoading}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
            >
              {isLoading ? "Skipping..." : "Skip for Now"}
            </Button>
            {step < 5 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Completing Setup..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
