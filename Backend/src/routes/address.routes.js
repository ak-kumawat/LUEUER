import { Router } from 'express'
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/address.controller.js'
import requireAuth from '../middlewares/requireAuth.js'

const router = Router()

router.get('/', requireAuth, getAddresses)
router.post('/', requireAuth, createAddress)
router.put('/:id', requireAuth, updateAddress)
router.delete('/:id', requireAuth, deleteAddress)
router.put('/:id/default', requireAuth, setDefaultAddress)

export default router
