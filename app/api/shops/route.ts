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

    const shops = await prisma.shop.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(shops)
  } catch (error) {
    console.error("Shops fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch shops" },
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

    const shop = await prisma.shop.create({
      data: {
        businessId: business.id,
        name: body.name,
        phone: body.phone || null,
        area: body.area || null,
        rateOt: body.rateOt || null,
        rateMedium: body.rateMedium || null,
      }
    })

    return NextResponse.json(shop)
  } catch (error) {
    console.error("Shop creation error:", error)
    return NextResponse.json(
      { error: "Failed to create shop" },
      { status: 500 }
    )
  }
}
