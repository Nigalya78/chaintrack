import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log("Middleware - Pathname:", pathname)
  
  const protectedPaths = ["/dashboard", "/inventory", "/labour", "/finishing", "/transactions", "/sales", "/reports", "/settings", "/setup"]
  
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  console.log("Middleware - Is protected path:", isProtectedPath)
  
  if (isProtectedPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    console.log("Middleware - Token:", token)
    console.log("Middleware - NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "Not set")
    
    if (!token) {
      console.log("Middleware - No token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register).*)"],
}
