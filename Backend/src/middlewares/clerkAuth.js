import { createClerkClient } from '@clerk/clerk-sdk-node'
import prisma from '../db/index.js'

let clerkClient

const getClerkClient = () => {
  if (!clerkClient) {
    clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  }
  return clerkClient
}

const clerkAuth = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.__session ||
      req.headers.authorization?.replace('Bearer ', '')

    if (!sessionToken) {
      req.user = null
      req.isAdmin = false
      return next()
    }

    const client = getClerkClient()

    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const clerkRequest = new Request(fullUrl, {
      method: req.method,
      headers: new Headers(req.headers)
    })

    const requestState = await client.authenticateRequest(clerkRequest, {
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY
    })

    if (!requestState.isSignedIn) {
      req.user = null
      req.isAdmin = false
      return next()
    }

    const clerkId = requestState.toAuth().userId
    const user = await client.users.getUser(clerkId)

    // Self-healing: Ensure user exists in local database
    let dbUser = await prisma.user.findUnique({ where: { clerkId } })
    if (!dbUser) {
      try {
        const emailAddress = user.emailAddresses?.[0]?.emailAddress
        await prisma.user.create({
          data: {
            clerkId,
            email: emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            isActive: true
          }
        })
        console.log(`Auto-synced user ${clerkId} to database.`)
      } catch (dbErr) {
        console.error("Failed to auto-sync user to database:", dbErr)
      }
    }

    req.user = user
    req.isAdmin = user.publicMetadata?.role === 'admin'

    next()

  } catch (error) {
    console.error("Clerk Auth Middleware Error:", error)
    req.user = null
    req.isAdmin = false
    next()
  }
}

export default clerkAuth