export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const token = session?.user as any
    
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
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Suppliers fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const token = session?.user as any
    
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

    const supplier = await prisma.supplier.create({
      data: {
        businessId: business.id,
        name: body.name,
        phone: body.phone,
        area: body.area || null,
      }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error("Supplier creation error:", error)
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    )
  }
}