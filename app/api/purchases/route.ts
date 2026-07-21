export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

function packetMultiplier(chainType: string) {
  return chainType === "OT" ? 24 : 40
}

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

    const purchases = await prisma.purchase.findMany({
      where: { businessId: business.id },
      include: {
        supplier: {
          select: { name: true }
        }
      },
      orderBy: { purchaseDate: "desc" }
    })

    const data = purchases.map((p) => ({
      id: p.id,
      supplierName: p.supplier.name,
      chainType: p.chainType,
      kilograms: p.kilograms,
      packetCount: p.packetCount,
      pricePerKg: p.pricePerKg,
      totalCost: p.totalCost,
      purchaseDate: p.purchaseDate.toISOString().slice(0, 10),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Purchases fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
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

    const packets = body.packetCount ? parseInt(body.packetCount) : Math.round(body.kilograms * packetMultiplier(body.chainType))
    const totalCost = Number((body.kilograms * body.pricePerKg).toFixed(2))

    const purchase = await prisma.purchase.create({
      data: {
        businessId: business.id,
        supplierId: body.supplierId,
        chainType: body.chainType,
        kilograms: body.kilograms,
        packetCount: packets,
        pricePerKg: body.pricePerKg,
        totalCost,
        purchaseDate: new Date(body.purchaseDate),
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("Purchase creation error:", error)
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    )
  }
}
