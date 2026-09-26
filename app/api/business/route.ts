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

    return NextResponse.json({
      name: business.name,
      ownerName: business.ownerName,
    })
  } catch (error) {
    console.error("Business fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch business data" },
      { status: 500 }
    )
  }
}
