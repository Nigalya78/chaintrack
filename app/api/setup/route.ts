import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { userId, businessId } = data

    if (!userId || !businessId) {
      return NextResponse.json({ error: "Missing user or business ID" }, { status: 400 })
    }

    // Get business for user
    const business = await prisma.business.findUnique({
      where: { id: businessId, userId }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Update business details
    await prisma.business.update({
      where: { id: business.id },
      data: {
        logo: data.businessDetails.logo,
        address: data.businessDetails.address,
      }
    })

    // Create opening balance
    await prisma.openingBalance.create({
      data: {
        businessId: business.id,
        kanniOtKg: data.openingInventory.kanniOtKg,
        kanniMediumKg: data.openingInventory.kanniMediumKg,
        otChains: data.openingInventory.otChains,
        mediumChains: data.openingInventory.mediumChains,
        finishingOtChains: data.openingInventory.finishingOtChains || 0,
        finishingMediumChains: data.openingInventory.finishingMediumChains || 0,
      }
    })

    // Create labourers and their opening balances
    for (const labourer of data.labourers) {
      const createdLabourer = await prisma.labourer.create({
        data: {
          businessId: business.id,
          name: labourer.name,
          phone: labourer.phone || null,
        }
      })

      if (labourer.otChains > 0 || labourer.mediumChains > 0) {
        await prisma.labourOpeningBalance.create({
          data: {
            businessId: business.id,
            labourerId: createdLabourer.id,
            otChains: labourer.otChains,
            mediumChains: labourer.mediumChains,
          }
        })
      }
    }

    // Create finishing vendors and their opening balances
    for (const vendor of data.vendors) {
      const createdVendor = await prisma.finishingVendor.create({
        data: {
          businessId: business.id,
          name: vendor.name,
        }
      })

      if (vendor.otChains > 0 || vendor.mediumChains > 0) {
        await prisma.finishingOpeningBalance.create({
          data: {
            businessId: business.id,
            vendorId: createdVendor.id,
            otChains: vendor.otChains,
            mediumChains: vendor.mediumChains,
          }
        })
      }
    }

    // Initialize inventory records
    const inventoryTypes = [
      { type: "KANNI_OT", quantity: data.openingInventory.kanniOtKg, unit: "kg" },
      { type: "KANNI_MEDIUM", quantity: data.openingInventory.kanniMediumKg, unit: "kg" },
      { type: "CHAIN_OT", quantity: data.openingInventory.otChains, unit: "pieces" },
      { type: "CHAIN_MEDIUM", quantity: data.openingInventory.mediumChains, unit: "pieces" },
    ]

    for (const inv of inventoryTypes) {
      await prisma.inventory.create({
        data: {
          businessId: business.id,
          type: inv.type,
          quantity: inv.quantity,
          unit: inv.unit,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { error: "Setup failed" },
      { status: 500 }
    )
  }
}
