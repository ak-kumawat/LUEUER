import { Router } from 'express'
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js'
import requireAuth from '../middlewares/requireAuth.js'
import adminOnly from '../middlewares/adminOnly.js'

const router = Router()

router.get('/', getAllCategories)
router.get('/:slug', getCategoryBySlug)
router.post('/', requireAuth, adminOnly, createCategory)
router.put('/:id', requireAuth, adminOnly, updateCategory)
router.delete('/:id', requireAuth, adminOnly, deleteCategory)

export default router
