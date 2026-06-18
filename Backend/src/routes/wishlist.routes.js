import { Router } from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../controllers/wishlist.controller.js'
import requireAuth from '../middlewares/requireAuth.js'

const router = Router()

router.get('/', requireAuth, getWishlist)
router.post('/add', requireAuth, addToWishlist)
router.delete('/remove/:id', requireAuth, removeFromWishlist)

export default router
