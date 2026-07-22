import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log("Registration attempt for email:", body.email)
    
    const validated = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
      include: { business: true }
    })

    console.log("Existing user found:", !!existingUser)

    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(validated.password, 10)
    console.log("Password hashed, length:", hashedPassword.length)

    let user
    if (existingUser) {
      console.log("Updating existing user password...")
      user = await prisma.user.update({
        where: { email: validated.email },
        data: {
          password: hashedPassword,
          business: existingUser.business ? {
            update: {
              name: validated.businessName,
              ownerName: validated.ownerName,
              phone: validated.phone,
            }
          } : {
            create: {
              name: validated.businessName,
              ownerName: validated.ownerName,
              phone: validated.phone,
            }
          }
        },
        include: {
          business: true
        }
      })
      console.log("User updated successfully, ID:", user.id)
    } else {
      console.log("Creating new user...")
      user = await prisma.user.create({
        data: {
          email: validated.email,
          password: hashedPassword,
          business: {
            create: {
              name: validated.businessName,
              ownerName: validated.ownerName,
              phone: validated.phone,
            }
          }
        },
        include: {
          business: true
        }
      })
      console.log("User created successfully, ID:", user.id)
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      businessId: user.business?.id
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    )
  }
}
