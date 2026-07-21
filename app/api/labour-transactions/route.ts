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

    const transactions = await prisma.labourTransaction.findMany({
      where: { businessId: business.id },
      include: {
        labourer: {
          select: { name: true }
        }
      },
      orderBy: { transactionDate: "desc" }
    })

    const data = transactions.map((t) => ({
      id: t.id,
      labourerName: t.labourer.name,
      chainType: t.chainType,
      chainsGiven: t.chainsGiven,
      chainsReceived: t.chainsReceived,
      ratePerPiece: t.ratePerPiece,
      amountGiven: t.amountGiven,
      transactionDate: t.transactionDate.toISOString().slice(0, 10),
      notes: t.notes,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Labour transactions fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch labour transactions" },
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

    const labourer = await prisma.labourer.findUnique({
      where: { id: body.labourerId }
    })

    if (!labourer) {
      return NextResponse.json({ error: "Labourer not found" }, { status: 404 })
    }

    const rate = body.chainType === "OT" ? labourer.rateOt : labourer.rateMedium
    if (!rate) {
      return NextResponse.json(
        { error: `Rate per piece is missing for ${body.chainType}` },
        { status: 400 }
      )
    }

    const amountGiven = Number((Number(rate) * body.chainsReceived).toFixed(2))

    const transaction = await prisma.labourTransaction.create({
      data: {
        businessId: business.id,
        labourerId: body.labourerId,
        chainType: body.chainType,
        chainsGiven: body.chainsGiven,
        chainsReceived: body.chainsReceived,
        ratePerPiece: rate,
        amountGiven,
        transactionDate: new Date(body.transactionDate),
        notes: body.notes || null,
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Labour transaction creation error:", error)
    return NextResponse.json(
      { error: "Failed to create labour transaction" },
      { status: 500 }
    )
  }
}
