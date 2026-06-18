import prisma from '../db/index.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

const getUserFromClerk = async (clerkId) => {
  return await prisma.user.findUnique({ where: { clerkId } })
}

export const getCart = asyncHandler(async (req, res) => {
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  let cart = await prisma.cart.findUnique({
    where: { userId: dbUser.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true } } }
              }
            }
          }
        }
      }
    }
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: dbUser.id },
      include: { items: true }
    })
  }

  return res.status(200).json(
    new ApiResponse(200, cart, "Cart fetched")
  )
})

export const addToCart = asyncHandler(async (req, res) => {
  const { variantId, quantity = 1 } = req.body
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  if (!variantId) throw new ApiError(400, "Variant ID is required")

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId }
  })

  if (!variant) throw new ApiError(404, "Variant not found")
  if (!variant.isActive) throw new ApiError(400, "This variant is not available")
  if (variant.stockQuantity < quantity) throw new ApiError(400, "Insufficient stock")

  let cart = await prisma.cart.findUnique({ where: { userId: dbUser.id } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: dbUser.id } })
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, variantId }
  })

  let cartItem
  if (existingItem) {
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    })
  } else {
    cartItem = await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity }
    })
  }

  return res.status(200).json(
    new ApiResponse(200, cartItem, "Added to cart")
  )
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { quantity } = req.body

  if (!quantity || quantity < 1) throw new ApiError(400, "Valid quantity required")

  const cartItem = await prisma.cartItem.update({
    where: { id },
    data: { quantity }
  })

  return res.status(200).json(
    new ApiResponse(200, cartItem, "Cart updated")
  )
})

export const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params

  await prisma.cartItem.delete({ where: { id } })

  return res.status(200).json(
    new ApiResponse(200, null, "Item removed from cart")
  )
})

export const clearCart = asyncHandler(async (req, res) => {
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  const cart = await prisma.cart.findUnique({ where: { userId: dbUser.id } })
  if (!cart) throw new ApiError(404, "Cart not found")

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  return res.status(200).json(
    new ApiResponse(200, null, "Cart cleared")
  )
})
