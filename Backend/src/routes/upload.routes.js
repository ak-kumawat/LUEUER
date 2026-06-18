import { Router } from 'express'
import multer from 'multer'
import { uploadImage } from '../controllers/upload.controller.js'
import requireAuth from '../middlewares/requireAuth.js'
import adminOnly from '../middlewares/adminOnly.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './public/temp'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})

const upload = multer({ storage })

const router = Router()

router.post('/image', requireAuth, adminOnly, upload.single('image'), uploadImage)

export default router
