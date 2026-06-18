import prisma from '../db/index.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

const getUserFromClerk = async (clerkId) => {
  return await prisma.user.findUnique({ where: { clerkId } })
}

export const getRatingsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const ratings = await prisma.rating.findMany({
    where: { productId },
    select: { value: true }
  })

  const average = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
    : 0

  return res.status(200).json(
    new ApiResponse(200, {
      average: parseFloat(average.toFixed(1)),
      count: ratings.length
    }, "Ratings fetched")
  )
})

export const addRating = asyncHandler(async (req, res) => {
  const { productId, orderId, value } = req.body
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  if (!productId || !orderId || !value) {
    throw new ApiError(400, "Product, order and rating value are required")
  }

  if (value < 1 || value > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5")
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: dbUser.id,
      status: 'delivered'
    }
  })

  if (!order) {
    throw new ApiError(403, "You can only rate products from delivered orders")
  }

  const existing = await prisma.rating.findUnique({
    where: { userId_productId: { userId: dbUser.id, productId } }
  })

  if (existing) {
    throw new ApiError(409, "You have already rated this product")
  }

  const rating = await prisma.rating.create({
    data: {
      userId: dbUser.id,
      productId,
      orderId,
      value
    }
  })

  return res.status(201).json(
    new ApiResponse(201, rating, "Rating submitted")
  )
})
