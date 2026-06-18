import { Router } from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller.js'
import requireAuth from '../middlewares/requireAuth.js'

const router = Router()

router.get('/', requireAuth, getCart)
router.post('/add', requireAuth, addToCart)
router.put('/update/:id', requireAuth, updateCartItem)
router.delete('/remove/:id', requireAuth, removeFromCart)
router.delete('/clear', requireAuth, clearCart)

export default router
