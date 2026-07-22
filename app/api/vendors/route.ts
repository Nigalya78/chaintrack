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

    const suppliers = await prisma.supplier.findMany({
      where: { businessId: business.id },
      select: {
        id: true,
        name: true,
        phone: true,
        area: true,
      }
    })

    const finishingVendors = await prisma.finishingVendor.findMany({
      where: { businessId: business.id },
      select: {
        id: true,
        name: true,
        phone: true,
        area: true,
        rateOt: true,
        rateMedium: true,
      }
    })

    const vendors = [
      ...suppliers.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        area: s.area,
        type: "SUPPLIER" as const,
        rateOt: null,
        rateMedium: null,
      })),
      ...finishingVendors.map(v => ({
        id: v.id,
        name: v.name,
        phone: v.phone,
        area: v.area,
        type: "FINISHING" as const,
        rateOt: v.rateOt,
        rateMedium: v.rateMedium,
      }))
    ]

    return NextResponse.json(vendors)
  } catch (error) {
    console.error("Vendors fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
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

    if (body.type === "SUPPLIER") {
      const supplier = await prisma.supplier.create({
        data: {
          businessId: business.id,
          name: body.name,
          phone: body.phone || null,
          area: body.area || null,
        }
      })
      return NextResponse.json(supplier)
    } else if (body.type === "FINISHING") {
      const vendor = await prisma.finishingVendor.create({
        data: {
          businessId: business.id,
          name: body.name,
          phone: body.phone || null,
          area: body.area || null,
          rateOt: body.rateOt || null,
          rateMedium: body.rateMedium || null,
        }
      })
      return NextResponse.json(vendor)
    } else {
      return NextResponse.json({ error: "Invalid vendor type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Vendor creation error:", error)
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    )
  }
}
