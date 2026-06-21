import prisma from '../db/index.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

const getUserFromClerk = async (clerkId) => {
  return await prisma.user.findUnique({ where: { clerkId } })
}

export const getAddresses = asyncHandler(async (req, res) => {
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  const addresses = await prisma.address.findMany({
    where: { userId: dbUser.id, deletedAt: null },
    orderBy: { isDefault: 'desc' }
  })

  return res.status(200).json(
    new ApiResponse(200, addresses, "Addresses fetched")
  )
})

export const createAddress = asyncHandler(async (req, res) => {
  const { label, street, city, state, postalCode, country, isDefault } = req.body
  const dbUser = await getUserFromClerk(req.user.id)
  if (!dbUser) throw new ApiError(404, "User not found")

  if (!label || !street || !city || !state || !postalCode) {
    throw new ApiError(400, "All address fields are required")
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: dbUser.id, deletedAt: null },
      data: { isDefault: false }
    })
  }

  const address = await prisma.address.create({
    data: {
      userId: dbUser.id,
      label,
      street,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || false
    }
  })

  return res.status(201).json(
    new ApiResponse(201, address, "Address created")
  )
})

export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { label, street, city, state, postalCode, country, isDefault } = req.body

  const address = await prisma.address.findUnique({
    where: { id, deletedAt: null }
  })
  if (!address) throw new ApiError(404, "Address not found")

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: address.userId, deletedAt: null },
      data: { isDefault: false }
    })
  }

  const updated = await prisma.address.update({
    where: { id },
    data: {
      label: label || address.label,
      street: street || address.street,
      city: city || address.city,
      state: state || address.state,
      postalCode: postalCode || address.postalCode,
      country: country || address.country,
      isDefault: isDefault !== undefined ? isDefault : address.isDefault
    }
  })

  return res.status(200).json(
    new ApiResponse(200, updated, "Address updated")
  )
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params

  const address = await prisma.address.findUnique({
    where: { id }
  })
  if (!address) throw new ApiError(404, "Address not found")

  await prisma.address.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isDefault: false
    }
  })

  // If we deleted the default address, make the next most recent one default
  if (address.isDefault) {
    const nextDefault = await prisma.address.findFirst({
      where: {
        userId: address.userId,
        deletedAt: null
      },
      orderBy: { isDefault: 'desc' } // findFirst will pick whichever or we can do by creation time
    })
    
    if (nextDefault) {
      await prisma.address.update({
        where: { id: nextDefault.id },
        data: { isDefault: true }
      })
    }
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Address deleted")
  )
})

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params

  const address = await prisma.address.findUnique({ where: { id } })
  if (!address) throw new ApiError(404, "Address not found")

  await prisma.address.updateMany({
    where: { userId: address.userId, deletedAt: null },
    data: { isDefault: false }
  })

  await prisma.address.update({
    where: { id },
    data: { isDefault: true }
  })

  return res.status(200).json(
    new ApiResponse(200, null, "Default address updated")
  )
})
