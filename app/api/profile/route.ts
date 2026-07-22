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

    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      include: { business: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      email: user.email,
      business: user.business ? {
        name: user.business.name,
        ownerName: user.business.ownerName,
        phone: user.business.phone,
        logo: user.business.logo,
        address: user.business.address,
        setupCompleted: user.business.setupCompleted,
      } : null,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { business } = body

    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      include: { business: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: user.business.id },
      data: {
        name: business.name,
        ownerName: business.ownerName,
        phone: business.phone,
        logo: business.logo,
        address: business.address,
      }
    })

    return NextResponse.json({
      success: true,
      business: {
        name: updatedBusiness.name,
        ownerName: updatedBusiness.ownerName,
        phone: updatedBusiness.phone,
        logo: updatedBusiness.logo,
        address: updatedBusiness.address,
        setupCompleted: updatedBusiness.setupCompleted,
      }
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
