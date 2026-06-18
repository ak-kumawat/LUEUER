import prisma from '../db/index.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const getUserFromClerk = async (clerkId) => {
  return await prisma.user.findUnique({ where: { clerkId } })
}

const generateOrderNumber = async () => {
  const count = await prisma.order.count()
  const number = String(count + 1).padStart(5, '0')
  return `LUE-${number}`
}

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body

  if (!amount) throw new ApiError(400, "Amount is required")

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt_${Date.now()}`
  })

  return res.status(200).json(
    new ApiResponse(200, order, "Razorpay order created")
  )
})

export const placeOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddressId,
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    notes
  } = req.body

  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  if (!shippingAddressId) throw new ApiError(400, "Shipping address is required")

  if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      throw new ApiError(400, "Payment verification failed")
    }
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: dbUser.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true }
          }
        }
      }
    }
  })

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty")
  }

  let subtotal = 0
  const orderItems = cart.items.map(item => {
    const price = item.variant.priceOverride || item.variant.product.basePrice
    const total = parseFloat(price) * item.quantity
    subtotal += total
    return {
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: parseFloat(price),
      totalPrice: total
    }
  })

  const shippingFee = subtotal > 999 ? 0 : 99
  const totalAmount = subtotal + shippingFee
  const orderNumber = await generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      userId: dbUser.id,
      shippingAddressId,
      orderNumber,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: razorpayPaymentId ? 'paid' : 'unpaid',
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      notes: notes || null,
      items: { create: orderItems },
      statusHistory: {
        create: { status: 'pending', note: 'Order placed' }
      }
    },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      shippingAddress: true,
      statusHistory: true
    }
  })

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  return res.status(201).json(
    new ApiResponse(201, order, "Order placed successfully")
  )
})

export const getUserOrders = asyncHandler(async (req, res) => {
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  const orders = await prisma.order.findMany({
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
      },
      statusHistory: { orderBy: { changedAt: 'asc' } }
    },
    orderBy: { placedAt: 'desc' }
  })

  return res.status(200).json(
    new ApiResponse(200, orders, "Orders fetched")
  )
})

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { include: { images: true } } }
          }
        }
      },
      shippingAddress: true,
      statusHistory: { orderBy: { changedAt: 'asc' } }
    }
  })

  if (!order) throw new ApiError(404, "Order not found")

  return res.status(200).json(
    new ApiResponse(200, order, "Order fetched")
  )
})

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)

  const where = {}
  if (status) where.status = status

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        user: true,
        items: true,
        shippingAddress: true
      },
      orderBy: { placedAt: 'desc' }
    }),
    prisma.order.count({ where })
  ])

  return res.status(200).json(
    new ApiResponse(200, { orders, total }, "All orders fetched")
  )
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, note } = req.body

  if (!status) throw new ApiError(400, "Status is required")

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new ApiError(404, "Order not found")

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: { status, note: note || null }
      }
    },
    include: { statusHistory: true }
  })

  return res.status(200).json(
    new ApiResponse(200, updated, "Order status updated")
  )
})
