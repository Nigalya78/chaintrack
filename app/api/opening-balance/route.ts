export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: token.id as string },
      include: { openingBalance: true }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (!business.openingBalance) {
      return NextResponse.json({ error: "Opening balance not found" }, { status: 404 })
    }

    return NextResponse.json(business.openingBalance)
  } catch (error) {
    console.error("Opening balance fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch opening balance" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: token.id as string },
      include: { openingBalance: true }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const body = await request.json()

    if (!business.openingBalance) {
      // Create opening balance if it doesn't exist
      const openingBalance = await prisma.openingBalance.create({
        data: {
          businessId: business.id,
          kanniOtKg: body.kanniOtKg || 0,
          kanniMediumKg: body.kanniMediumKg || 0,
          otChains: body.otChains || 0,
          mediumChains: body.mediumChains || 0,
          finishingOtChains: body.finishingOtChains || 0,
          finishingMediumChains: body.finishingMediumChains || 0,
        }
      })

      // Update inventory records
      await updateInventory(business.id, body)

      return NextResponse.json(openingBalance)
    }

    // Update existing opening balance
    const openingBalance = await prisma.openingBalance.update({
      where: { id: business.openingBalance.id },
      data: {
        kanniOtKg: body.kanniOtKg,
        kanniMediumKg: body.kanniMediumKg,
        otChains: body.otChains,
        mediumChains: body.mediumChains,
        finishingOtChains: body.finishingOtChains || 0,
        finishingMediumChains: body.finishingMediumChains || 0,
      }
    })

    // Update inventory records
    await updateInventory(business.id, body)

    return NextResponse.json(openingBalance)
  } catch (error) {
    console.error("Opening balance update error:", error)
    return NextResponse.json(
      { error: "Failed to update opening balance" },
      { status: 500 }
    )
  }
}

async function updateInventory(businessId: string, data: any) {
  const inventoryUpdates = [
    { type: "KANNI_OT", quantity: data.kanniOtKg, unit: "kg" },
    { type: "KANNI_MEDIUM", quantity: data.kanniMediumKg, unit: "kg" },
    { type: "CHAIN_OT", quantity: data.otChains, unit: "pieces" },
    { type: "CHAIN_MEDIUM", quantity: data.mediumChains, unit: "pieces" },
  ]

  for (const inv of inventoryUpdates) {
    const existing = await prisma.inventory.findUnique({
      where: {
        businessId_type: {
          businessId,
          type: inv.type
        }
      }
    })

    if (existing) {
      await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantity: inv.quantity }
      })
    } else {
      await prisma.inventory.create({
        data: {
          businessId,
          type: inv.type,
          quantity: inv.quantity,
          unit: inv.unit
        }
      })
    }
  }
}
