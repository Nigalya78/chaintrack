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

    const transactions = await prisma.finishingTransaction.findMany({
      where: { businessId: business.id },
      include: {
        vendor: {
          select: { name: true }
        }
      },
      orderBy: { transactionDate: "desc" }
    })

    const data = transactions.map((t) => ({
      id: t.id,
      vendorName: t.vendor.name,
      chainType: t.chainType,
      chainsGiven: t.chainsGiven,
      finishedChainsReceived: t.finishedChainsReceived,
      ratePerPiece: t.ratePerPiece,
      transactionDate: t.transactionDate.toISOString().slice(0, 10),
      notes: t.notes,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Finishing transactions fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch finishing transactions" },
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

    const vendor = await prisma.finishingVendor.findUnique({
      where: { id: body.vendorId }
    })

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    const transaction = await prisma.finishingTransaction.create({
      data: {
        businessId: business.id,
        vendorId: body.vendorId,
        chainType: body.chainType,
        chainsGiven: body.chainsGiven,
        finishedChainsReceived: body.finishedChainsReceived,
        ratePerPiece: body.ratePerPiece || null,
        transactionDate: new Date(body.transactionDate),
        notes: body.notes || null,
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Finishing transaction creation error:", error)
    return NextResponse.json(
      { error: "Failed to create finishing transaction" },
      { status: 500 }
    )
  }
}
