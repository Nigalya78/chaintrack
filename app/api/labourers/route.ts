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

    const labourers = await prisma.labourer.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(labourers)
  } catch (error) {
    console.error("Labourers fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch labourers" },
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

    const labourer = await prisma.labourer.create({
      data: {
        businessId: business.id,
        name: body.name,
        phone: body.phone || null,
        rateOt: body.rateOt || null,
        rateMedium: body.rateMedium || null,
      }
    })

    return NextResponse.json(labourer)
  } catch (error) {
    console.error("Labourer creation error:", error)
    return NextResponse.json(
      { error: "Failed to create labourer" },
      { status: 500 }
    )
  }
}
