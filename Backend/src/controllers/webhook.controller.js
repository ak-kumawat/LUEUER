import prisma from '../db/index.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

export const handleClerkWebhook = asyncHandler(async (req, res) => {
  const { type, data } = req.body

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
