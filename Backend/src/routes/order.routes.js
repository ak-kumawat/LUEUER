import { Router } from 'express'
import {
  createRazorpayOrder,
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
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

export default router
