import { Router } from 'express'
import {
  createRazorpayOrder,
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  markOrderAsRefunded
} from '../controllers/order.controller.js'
import requireAuth from '../middlewares/requireAuth.js'
import adminOnly from '../middlewares/adminOnly.js'

const router = Router()

router.post('/razorpay', requireAuth, createRazorpayOrder)
router.post('/', requireAuth, placeOrder)
router.get('/', requireAuth, getUserOrders)
router.get('/admin/all', requireAuth, adminOnly, getAllOrders)
router.get('/:id', requireAuth, getOrderById)
router.put('/admin/:id/status', requireAuth, adminOnly, updateOrderStatus)
router.post('/:id/cancel', requireAuth, cancelOrder)
router.put('/admin/:id/refund', requireAuth, adminOnly, markOrderAsRefunded)

export default router
