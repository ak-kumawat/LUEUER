import { Router } from 'express'
import {
  getRatingsByProduct,
  addRating
} from '../controllers/rating.controller.js'
import requireAuth from '../middlewares/requireAuth.js'

const router = Router()

router.get('/product/:productId', getRatingsByProduct)
router.post('/', requireAuth, addRating)

export default router
