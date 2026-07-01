import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth()

    // Access custom role from metadata (make sure you added metadata: {{user.public_metadata}} in Clerk dashboard under Sessions)
    const role = sessionClaims?.metadata?.role

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API / TRPC routes
    "/(api|trpc)(.*)",
  ],
}
