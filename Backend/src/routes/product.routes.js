import { Router } from 'express'
import {
  getAllProducts,
  getProductBySlug,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage
} from '../controllers/product.controller.js'
import requireAuth from '../middlewares/requireAuth.js'
import adminOnly from '../middlewares/adminOnly.js'

const router = Router()

router.get('/', getAllProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:slug', getProductBySlug)
router.post('/', requireAuth, adminOnly, createProduct)
router.put('/:id', requireAuth, adminOnly, updateProduct)
router.delete('/:id', requireAuth, adminOnly, deleteProduct)
router.post('/:id/images', requireAuth, adminOnly, addProductImage)

export default router
