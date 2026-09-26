export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    const existing = await prisma.shop.findFirst({
      where: { id, businessId: business.id }
    })

    if (!existing) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    await prisma.shop.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Shop delete error:", error)
    return NextResponse.json({ error: "Failed to delete shop" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { id } = params

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const existing = await prisma.shop.findFirst({
      where: { id, businessId: business.id }
    })

    if (!existing) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    const updated = await prisma.shop.update({
      where: { id },
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        area: body.area?.trim() || null,
        rateOt: body.rateOt ?? null,
        rateMedium: body.rateMedium ?? null,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Shop update error:", error)
    return NextResponse.json({ error: "Failed to update shop" }, { status: 500 })
  }
}
