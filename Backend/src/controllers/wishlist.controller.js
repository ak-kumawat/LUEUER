import prisma from '../db/index.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

const getUserFromClerk = async (clerkId) => {
  return await prisma.user.findUnique({ where: { clerkId } })
}

export const getWishlist = asyncHandler(async (req, res) => {
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: dbUser.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true } },
          variants: { where: { isActive: true } }
        }
      }
    },
    orderBy: { addedAt: 'desc' }
  })

  return res.status(200).json(
    new ApiResponse(200, wishlist, "Wishlist fetched")
  )
})

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  if (!productId) throw new ApiError(400, "Product ID is required")

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: dbUser.id, productId } }
  })

  if (existing) {
    throw new ApiError(409, "Product already in wishlist")
  }

  const wishlistItem = await prisma.wishlist.create({
    data: { userId: dbUser.id, productId }
  })

  return res.status(201).json(
    new ApiResponse(201, wishlistItem, "Added to wishlist")
  )
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params

  await prisma.wishlist.delete({ where: { id } })

  return res.status(200).json(
    new ApiResponse(200, null, "Removed from wishlist")
  )
})
