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
      where: { userId: token.id as string }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const adjustments = await prisma.adjustment.findMany({
      where: { businessId: business.id },
      orderBy: { adjustmentDate: "desc" }
    })

    const data = adjustments.map((a) => ({
      id: a.id,
      type: a.type,
      quantity: a.quantity,
      reason: a.reason,
      adjustmentDate: a.adjustmentDate.toISOString().slice(0, 10),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Adjustments fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch adjustments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: token.id as string }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const body = await request.json()
    const quantity = body.adjustmentType === "REMOVE" ? -body.quantity : body.quantity
    const inventoryType = body.chainType === "OT" ? "CHAIN_OT" : "CHAIN_MEDIUM"

    // Create adjustment record
    const adjustment = await prisma.adjustment.create({
      data: {
        businessId: business.id,
        type: inventoryType,
        quantity: quantity,
        reason: body.reason,
        adjustmentDate: new Date(body.adjustmentDate),
      }
    })

    // Update actual inventory
    const inventory = await prisma.inventory.findUnique({
      where: {
        businessId_type: {
          businessId: business.id,
          type: inventoryType
        }
      }
    })

    if (inventory) {
      await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: {
            increment: quantity
          }
        }
      })
    } else {
      // Create inventory record if it doesn't exist
      await prisma.inventory.create({
        data: {
          businessId: business.id,
          type: inventoryType,
          quantity: quantity,
          unit: "pieces"
        }
      })
    }

    return NextResponse.json(adjustment)
  } catch (error) {
    console.error("Adjustment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    )
  }
}
