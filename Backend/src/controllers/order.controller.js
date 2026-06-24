import prisma from '../db/index.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'
import { sendOrderConfirmationEmail } from '../util/email.js'
import { calculateCartWeight, checkServiceabilityAndRates } from '../util/shiprocket.js'

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
  const { shippingAddressId } = req.body

  if (!shippingAddressId) {
    throw new ApiError(400, "shippingAddressId is required")
  }

  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) {
    throw new ApiError(404, "User not found")
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: dbUser.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { include: { categories: { include: { category: true } } } } }
          }
        }
      }
    }
  })

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty")
  }

  // Verify stock levels before initiating payment order
  for (const item of cart.items) {
    if (item.quantity > item.variant.stockQuantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${item.variant.product.name} (${item.variant.size}). Available: ${item.variant.stockQuantity}`
      )
    }
  }

  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId: dbUser.id }
  })
  if (!address) {
    throw new ApiError(404, "Shipping address not found")
  }

  let subtotal = 0
  for (const item of cart.items) {
    const price = item.variant.priceOverride || item.variant.product.basePrice
    subtotal += parseFloat(price) * item.quantity
  }

  const computedWeight = calculateCartWeight(cart.items)
  const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "302001"

  const checkResult = await checkServiceabilityAndRates({
    pickupPostcode,
    deliveryPostcode: address.postalCode,
    weight: computedWeight,
    cod: 1
  })

  const shippingFee = checkResult.serviceable ? (checkResult.cheapest_rate || 0) : 0
  const totalAmount = subtotal + shippingFee

  const order = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
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

  const normalizedMethod = paymentMethod || 'razorpay'
  if (normalizedMethod === 'razorpay') {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new ApiError(400, "Razorpay payment details are required for online payment")
    }
  }

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

  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId: dbUser.id }
  })
  if (!address) throw new ApiError(404, "Shipping address not found")

  const computedWeight = calculateCartWeight(cart.items)
  const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "302001"

  const checkResult = await checkServiceabilityAndRates({
    pickupPostcode,
    deliveryPostcode: address.postalCode,
    weight: computedWeight,
    cod: 1
  })

  const shippingFee = checkResult.serviceable ? (checkResult.cheapest_rate || 0) : 0
  const totalAmount = subtotal + shippingFee
  const orderNumber = await generateOrderNumber()

  const order = await prisma.$transaction(async (tx) => {
    // 1. Atomically check and decrement stock for each item
    for (const item of cart.items) {
      const updateRes = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          stockQuantity: { gte: item.quantity }
        },
        data: {
          stockQuantity: { decrement: item.quantity }
        }
      })
      if (updateRes.count === 0) {
        throw new ApiError(400, `Insufficient stock for product ${item.variant.product.name} (${item.variant.size})`)
      }
    }

    // 2. Create the order
    const newOrder = await tx.order.create({
      data: {
        userId: dbUser.id,
        shippingAddressId,
        orderNumber,
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod: normalizedMethod,
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

    // 3. Clear cart items
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

    return newOrder
  }, {
    timeout: 15000 // 15 seconds to prevent timeout on slow database connections
  })

  // Send confirmation email asynchronously
  sendOrderConfirmationEmail(order, dbUser.email).catch(err => {
    console.error("Order confirmation email failed:", err)
  })

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

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params

  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  })

  if (!order) throw new ApiError(404, "Order not found")

  // Verify ownership
  if (order.userId !== dbUser.id) {
    throw new ApiError(403, "You do not have permission to cancel this order")
  }

  // Guard: Order must be pending and not already registered with Shiprocket
  if (order.status !== 'pending') {
    throw new ApiError(400, `Cannot cancel order in ${order.status} state`)
  }

  if (order.shiprocketOrderId || order.awbCode) {
    throw new ApiError(400, "Cannot cancel order as shipment has already been initiated")
  }

  // Determine payment status update
  let newPaymentStatus = order.paymentStatus
  if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid') {
    newPaymentStatus = 'refund_pending'
  } else if (order.paymentMethod === 'cod') {
    newPaymentStatus = 'unpaid'
  }

  // Revert Stock quantities
  for (const item of order.items) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: {
        stockQuantity: {
          increment: item.quantity
        }
      }
    })
  }

  // Update order status to cancelled
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'cancelled',
      paymentStatus: newPaymentStatus,
      statusHistory: {
        create: {
          status: 'cancelled',
          note: 'Cancelled by customer'
        }
      }
    },
    include: { statusHistory: true }
  })

  return res.status(200).json(
    new ApiResponse(200, updatedOrder, "Order cancelled successfully")
  )
})

export const markOrderAsRefunded = asyncHandler(async (req, res) => {
  const { id } = req.params

  const order = await prisma.order.findUnique({
    where: { id }
  })

  if (!order) throw new ApiError(404, "Order not found")

  if (order.status !== 'cancelled') {
    throw new ApiError(400, "Cannot mark refund on a non-cancelled order")
  }

  if (order.paymentStatus !== 'refund_pending') {
    throw new ApiError(400, "Order is not in refund pending status")
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: 'refunded',
      statusHistory: {
        create: {
          status: 'cancelled',
          note: 'Manual refund confirmed by admin'
        }
      }
    },
    include: { statusHistory: true }
  })

  return res.status(200).json(
    new ApiResponse(200, updatedOrder, "Order marked as refunded")
  )
})
