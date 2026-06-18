import prisma from '../db/index.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, featured, page = 1, limit = 12 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)

  const where = { isActive: true }

  if (featured === 'true') {
    where.isFeatured = true
  }

  if (category) {
    where.categories = {
      some: {
        category: { slug: category }
      }
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        images: { where: { isPrimary: true } },
        variants: { where: { isActive: true } },
        categories: { include: { category: true } },
        ratings: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ])

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    }, "Products fetched")
  )
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { where: { isActive: true } },
      categories: { include: { category: true } },
      ratings: true
    }
  })

  if (!product) {
    throw new ApiError(404, "Product not found")
  }

  return res.status(200).json(
    new ApiResponse(200, product, "Product fetched")
  )
})

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    include: {
      images: { where: { isPrimary: true } },
      variants: { where: { isActive: true } },
      ratings: true
    }
  })

  return res.status(200).json(
    new ApiResponse(200, products, "Featured products fetched")
  )
})

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name, slug, description, basePrice,
    thumbnailUrl, isFeatured, categoryIds, variants
  } = req.body

  if (!name || !slug || !description || !basePrice) {
    throw new ApiError(400, "Name, slug, description and price are required")
  }

  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) {
    throw new ApiError(409, "Product with this slug already exists")
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      basePrice: parseFloat(basePrice),
      thumbnailUrl: thumbnailUrl || null,
      isFeatured: isFeatured || false,
      categories: categoryIds ? {
        create: categoryIds.map(categoryId => ({ categoryId }))
      } : undefined,
      variants: variants ? {
        create: variants.map(v => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stockQuantity: v.stockQuantity || 0,
          priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
          sku: v.sku
        }))
      } : undefined
    },
    include: {
      categories: { include: { category: true } },
      variants: true,
      images: true
    }
  })

  return res.status(201).json(
    new ApiResponse(201, product, "Product created")
  )
})

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    name, slug, description, basePrice,
    thumbnailUrl, isFeatured, isActive
  } = req.body

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw new ApiError(404, "Product not found")
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: name || product.name,
      slug: slug || product.slug,
      description: description || product.description,
      basePrice: basePrice ? parseFloat(basePrice) : product.basePrice,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : product.thumbnailUrl,
      isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
      isActive: isActive !== undefined ? isActive : product.isActive
    },
    include: {
      images: true,
      variants: true,
      categories: { include: { category: true } }
    }
  })

  return res.status(200).json(
    new ApiResponse(200, updated, "Product updated")
  )
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw new ApiError(404, "Product not found")
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false }
  })

  return res.status(200).json(
    new ApiResponse(200, null, "Product deactivated")
  )
})

export const addProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { imageUrl, isPrimary, displayOrder } = req.body

  if (!imageUrl) {
    throw new ApiError(400, "Image URL is required")
  }

  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: id },
      data: { isPrimary: false }
    })
  }

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      imageUrl,
      isPrimary: isPrimary || false,
      displayOrder: displayOrder || 0
    }
  })

  return res.status(201).json(
    new ApiResponse(201, image, "Image added")
  )
})
