import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { business: true }
        })

        console.log("User found:", !!user)
        if (!user) {
          console.log("User not found")
          return null
        }

        console.log("User password exists:", !!user.password)
        console.log("Password length:", user.password?.length)

        if (!user.password) {
          console.log("User has no password set")
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        console.log("Password valid:", isPasswordValid)
        if (!isPasswordValid) {
          console.log("Password invalid")
          return null
        }

        const result = {
          id: user.id,
          email: user.email,
          name: user.business?.ownerName || "",
        }
        console.log("Returning user:", result)
        return result
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 year — effectively "stay logged in until logout"
    updateAge: 24 * 60 * 60,    // refresh the token once per day on activity
  },
  // Explicitly set cookie maxAge so the cookie is PERSISTENT (survives browser close).
  // Without this, NextAuth issues a session cookie with no expiry, which browsers
  // delete when the window is closed — causing the "logout on close" symptom.
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 365 * 24 * 60 * 60, // must match session.maxAge
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl
      const isLoggedIn = !!session?.user

      // Public pages — always allow
      const publicPages = ["/login", "/register", "/forgot-password"]
      if (publicPages.some((p) => pathname.startsWith(p))) {
        // If already logged in, bounce away from login/register to dashboard
        if (isLoggedIn && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
          return Response.redirect(new URL("/dashboard", request.nextUrl))
        }
        return true
      }

      // Everything else requires a session
      if (!isLoggedIn) {
        return false // NextAuth will redirect to the signIn page (/login)
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
