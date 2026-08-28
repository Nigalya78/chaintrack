export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "SUPPLIER") {
      const existing = await prisma.supplier.findFirst({
        where: { id, businessId: business.id }
      })
      if (!existing) {
        return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
      }
      await prisma.supplier.delete({ where: { id } })
      return NextResponse.json({ success: true })
    } else if (type === "FINISHING") {
      const existing = await prisma.finishingVendor.findFirst({
        where: { id, businessId: business.id }
      })
      if (!existing) {
        return NextResponse.json({ error: "Finishing vendor not found" }, { status: 404 })
      }
      await prisma.finishingVendor.delete({ where: { id } })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Invalid vendor type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Vendor delete error:", error)
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { id } = params

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (body.type === "SUPPLIER") {
      // Check the record belongs to this business
      const existing = await prisma.supplier.findFirst({
        where: { id, businessId: business.id }
      })
      if (!existing) {
        return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
      }

      const updated = await prisma.supplier.update({
        where: { id },
        data: {
          name: body.name.trim(),
          phone: body.phone?.trim() || null,
          area: body.area?.trim() || null,
        }
      })
      return NextResponse.json({ ...updated, type: "SUPPLIER" })
    } else if (body.type === "FINISHING") {
      const existing = await prisma.finishingVendor.findFirst({
        where: { id, businessId: business.id }
      })
      if (!existing) {
        return NextResponse.json({ error: "Finishing vendor not found" }, { status: 404 })
      }

      const updated = await prisma.finishingVendor.update({
        where: { id },
        data: {
          name: body.name.trim(),
          phone: body.phone?.trim() || null,
          area: body.area?.trim() || null,
          rateOt: body.rateOt ?? null,
          rateMedium: body.rateMedium ?? null,
        }
      })
      return NextResponse.json({ ...updated, type: "FINISHING" })
    } else {
      return NextResponse.json({ error: "Invalid vendor type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Vendor update error:", error)
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 })
  }
}
