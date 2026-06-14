import { clerkMiddleware, getAuth } from "@clerk/express"

/**
 * Base Clerk middleware – validates JWT and puts `req.auth` on the request.
 */
export const clerkAuth = clerkMiddleware();

/**
 * Helper to protect routes.
 * - Rejects unauthenticated requests (401)
 * - Adds `req.userId` and `req.isAdmin` for downstream handlers.
 */
export const requireAuth = (req, res, next) => {
  const { userId, header } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }
  // Attach useful fields
  req.userId = userId;

  // ----‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑-
  // *** ADMIN LOGIC ***
  // Adjust this rule to match however you mark an admin in Clerk.
  // Example: a custom claim `public.role === "admin"` stored in metadata.
  const isAdmin = header?.claims?.metadata?.public?.role === "admin";
  req.isAdmin = Boolean(isAdmin);
  // ------------------------------------------------------------------------
  next();
};

/**
 * Export raw Clerk helper for controllers that need the full token payload.
 */
export { getAuth };
