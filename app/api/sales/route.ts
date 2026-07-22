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

    const sales = await prisma.sale.findMany({
      where: { businessId: business.id },
      include: {
        shop: {
          select: { name: true }
        }
      },
      orderBy: { saleDate: "desc" }
    })

    const data = sales.map((s) => ({
      id: s.id,
      shopName: s.shop.name,
      chainType: s.chainType,
      chainCount: s.chainCount,
      pricePerChain: s.pricePerChain,
      totalAmount: s.totalAmount,
      saleDate: s.saleDate.toISOString().slice(0, 10),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Sales fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales" },
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

    const shop = await prisma.shop.findUnique({
      where: { id: body.shopId }
    })

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    const totalAmount = body.pricePerChain ? Number((body.chainCount * body.pricePerChain).toFixed(2)) : null

    const sale = await prisma.sale.create({
      data: {
        businessId: business.id,
        shopId: body.shopId,
        chainType: body.chainType,
        chainCount: body.chainCount,
        pricePerChain: body.pricePerChain || null,
        totalAmount,
        saleDate: new Date(body.saleDate),
      }
    })

    // Update inventory - decrease finished chain stock
    const finishedChainType = body.chainType === "OT" ? "FINISHED_CHAIN_OT" : "FINISHED_CHAIN_MEDIUM"

    await prisma.inventory.upsert({
      where: {
        businessId_type: {
          businessId: business.id,
          type: finishedChainType,
        }
      },
      update: {
        quantity: {
          decrement: body.chainCount,
        }
      },
      create: {
        businessId: business.id,
        type: finishedChainType,
        quantity: -body.chainCount,
        unit: "pieces",
      }
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Sale creation error:", error)
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    )
  }
}
