import { Router } from 'express'
import webhookRoutes from './webhook.routes.js'
import categoryRoutes from './category.routes.js'
import productRoutes from './product.routes.js'
import cartRoutes from './cart.routes.js'
import wishlistRoutes from './wishlist.routes.js'
import addressRoutes from './address.routes.js'
import orderRoutes from './order.routes.js'
import ratingRoutes from './rating.routes.js'
import uploadRoutes from './upload.routes.js'
import shiprocketRoutes from './shiprocket.routes.js'
import ApiResponse from '../util/ApiResponse.js'

const router = Router()

router.use('/webhooks', webhookRoutes)
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/wishlist', wishlistRoutes)
router.use('/addresses', addressRoutes)
router.use('/orders', orderRoutes)
router.use('/ratings', ratingRoutes)
router.use('/upload', uploadRoutes)
router.use('/shiprocket', shiprocketRoutes)

router.post('/contact', async (req, res) => {
  const { name, email, message, phone } = req.body

  if (!name || !email || !message) {
    return res.status(400).json(new ApiResponse(400, null, "All fields (name, email, message) are required"))
  }

  // Forward message via Resend API if API key is configured
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LURUER Contact <onboarding@resend.dev>',
          to: 'lueuer.world@gmail.com',
          subject: `New Message from ${name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px; color: #333;">
              <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #111;">New Contact Form Submission</h2>
              <p style="margin: 15px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 15px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 15px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p style="margin: 15px 0;"><strong>Message:</strong></p>
              <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #1043c7; margin: 15px 0; font-style: italic; white-space: pre-wrap; line-height: 1.6;">
                ${message}
              </div>
            </div>
          `
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Resend API error:", errorData)
      }
    } catch (error) {
      console.error("Failed to send email via Resend:", error)
    }
  } else {
    console.log("Resend API key not configured. Message received:", { name, email, message })
  }

  return res.status(200).json(new ApiResponse(200, null, "Message forwarded successfully"))
})

export default router
