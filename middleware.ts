export { auth as default } from "@/lib/auth"

export const config = {
  // Skip middleware for: API routes, Next.js internals, and ALL static files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|otf)).*)",
  ],
}
