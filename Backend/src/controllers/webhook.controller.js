import { Webhook } from 'svix'
import prisma from '../db/index.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'
import ApiError from '../util/ApiError.js'

export const handleClerkWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  let payload = req.body

  if (webhookSecret) {
    const svixId = req.headers['svix-id']
    const svixTimestamp = req.headers['svix-timestamp']
    const svixSignature = req.headers['svix-signature']

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new ApiError(400, 'Missing svix headers')
    }

    const wh = new Webhook(webhookSecret)
    try {
      const rawBody = req.rawBody || JSON.stringify(req.body)
      payload = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      throw new ApiError(400, 'Invalid webhook signature')
    }
  } else {
    console.warn('⚠️ CLERK_WEBHOOK_SECRET is not configured. Webhook signature validation skipped.')
  }

  const { type, data } = payload

  if (type === 'user.created') {
    const emailAddress = data.email_addresses?.[0]?.email_address

    await prisma.user.create({
      data: {
        clerkId: data.id,
        email: emailAddress,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        isActive: true
      }
    })
  }

  if (type === 'user.updated') {
    const emailAddress = data.email_addresses?.[0]?.email_address

    await prisma.user.update({
      where: { clerkId: data.id },
      data: {
        email: emailAddress,
        firstName: data.first_name || '',
        lastName: data.last_name || ''
      }
    })
  }

  if (type === 'user.deleted') {
    await prisma.user.update({
      where: { clerkId: data.id },
      data: { deletedAt: new Date() }
    })
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Webhook handled")
  )
})
