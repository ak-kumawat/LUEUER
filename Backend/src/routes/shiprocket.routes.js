import { Router } from 'express'
import requireAuth from '../middlewares/requireAuth.js'
import adminOnly from '../middlewares/adminOnly.js'
import asyncHandler from '../util/asyncHandler.js'
import ApiResponse from '../util/ApiResponse.js'
import ApiError from '../util/ApiError.js'
import prisma from '../db/index.js'
import {
  createShiprocketOrder,
  trackShipment,
  cancelShiprocketOrder,
  calculateCartWeight,
  checkServiceabilityAndRates
} from '../util/shiprocket.js'
import { sendOrderShippedEmail } from '../util/email.js'

const router = Router()

// Check delivery serviceability and rates for a pincode
router.post(
  '/serviceability',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { delivery_postcode, cod = 1 } = req.body

    if (!delivery_postcode) {
      throw new ApiError(400, "Delivery postcode is required")
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: req.user.id }
    })

    if (!dbUser) {
      throw new ApiError(404, "User not found")
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: dbUser.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    categories: {
                      include: {
                        category: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const cartItems = cart?.items || []
    const computedWeight = calculateCartWeight(cartItems)
    const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "302001"

    const checkResult = await checkServiceabilityAndRates({
      pickupPostcode,
      deliveryPostcode: delivery_postcode,
      weight: computedWeight,
      cod: parseInt(cod) || 0
    })

    return res.status(200).json(
      new ApiResponse(200, {
        weight: computedWeight,
        pickup_postcode: pickupPostcode,
        delivery_postcode: delivery_postcode,
        ...checkResult
      }, "Serviceability checked successfully")
    )
  })
)

// Admin clicks button → creates shipment in Shiprocket
router.post(
  '/create/:orderId',
  requireAuth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        shippingAddress: true,
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      }
    })

    if (!order) throw new ApiError(404, "Order not found")

    if (order.status === 'cancelled') {
      throw new ApiError(400, "Cannot ship cancelled order")
    }

    // Create in Shiprocket
    const shiprocketRes = await createShiprocketOrder(order)

    // Update order with Shiprocket details and status = shipped
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        shiprocketOrderId: shiprocketRes.order_id ? String(shiprocketRes.order_id) : null,
        awbCode: shiprocketRes.awb_code || null,
        courierName: shiprocketRes.courier_name || null,
        statusHistory: {
          create: {
            status: 'shipped',
            note: `Shipment created. Shiprocket Order ID: ${shiprocketRes.order_id}, AWB: ${shiprocketRes.awb_code || 'N/A'}, Courier: ${shiprocketRes.courier_name || 'N/A'}`
          }
        }
      },
      include: {
        shippingAddress: true
      }
    })

    // Send shipment notification email asynchronously
    const trackingData = {
      awbCode: shiprocketRes.awb_code,
      courierName: shiprocketRes.courier_name
    }
    sendOrderShippedEmail(updatedOrder, trackingData, order.user.email).catch(err => {
      console.error("Order shipped email failed:", err)
    })

    return res.status(200).json(
      new ApiResponse(200, {
        shiprocketOrderId: shiprocketRes.order_id,
        shipmentId: shiprocketRes.shipment_id,
        awbCode: shiprocketRes.awb_code,
        courierName: shiprocketRes.courier_name
      }, "Shipment created successfully")
    )
  })
)

// Track order
router.get(
  '/track/:orderId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true, shiprocketOrderId: true }
    })

    if (!order) throw new ApiError(404, "Order not found")

    const trackingIdentifier = order.shiprocketOrderId || order.orderNumber
    const tracking = await trackShipment(trackingIdentifier)

    return res.status(200).json(
      new ApiResponse(200, tracking, "Tracking fetched")
    )
  })
)

// Cancel shipment
router.post(
  '/cancel/:orderId',
  requireAuth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) throw new ApiError(404, "Order not found")

    const targetId = order.shiprocketOrderId || order.orderNumber
    await cancelShiprocketOrder([targetId])

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        statusHistory: {
          create: {
            status: 'cancelled',
            note: 'Shipment cancelled'
          }
        }
      }
    })

    return res.status(200).json(
      new ApiResponse(200, null, "Shipment cancelled")
    )
  })
)

export default router
