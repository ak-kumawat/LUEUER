import { createClerkClient } from '@clerk/clerk-sdk-node'

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

    const user = await client.users.getUser(requestState.toAuth().userId)

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