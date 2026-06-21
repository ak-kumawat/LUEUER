import prisma from '../db/index.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, featured, all, page = 1, limit = 12 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)

  const where = {}

  if (all !== 'true') {
    where.isActive = true
  }

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
        images: { orderBy: { displayOrder: 'asc' } },
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
      images: { orderBy: { displayOrder: 'asc' } },
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
    name, slug, tagline, description, basePrice,
    thumbnailUrl, isFeatured, defaultRating, categoryIds, variants, imageUrls
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
      tagline: tagline || null,
      description,
      basePrice: parseFloat(basePrice),
      thumbnailUrl: thumbnailUrl || (imageUrls && imageUrls.length > 0 ? imageUrls[0] : null),
      isFeatured: isFeatured || false,
      defaultRating: defaultRating ? parseFloat(defaultRating) : 4.8,
      categories: categoryIds ? {
        create: categoryIds.map(categoryId => ({ categoryId }))
      } : undefined,
      variants: variants ? {
        create: variants.map(v => ({
          size: v.size,
          color: v.color || "Carbon Black",
          colorHex: v.colorHex || "#121212",
          stockQuantity: parseInt(v.stockQuantity) || 0,
          priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
          sku: v.sku || `LUR-${slug.toUpperCase()}-${v.size.toUpperCase()}`
        }))
      } : undefined,
      images: imageUrls ? {
        create: imageUrls.map((url, idx) => ({
          imageUrl: url,
          isPrimary: idx === 0,
          displayOrder: idx
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
    name, slug, tagline, description, basePrice,
    thumbnailUrl, isFeatured, defaultRating, isActive, variants
  } = req.body

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true }
  })
  if (!product) {
    throw new ApiError(404, "Product not found")
  }

  // Update variants if provided
  if (variants && variants.length > 0) {
    // Keep track of incoming variant IDs to know which ones should remain active
    const activeIncomingIds = variants.map(v => v.id).filter(Boolean)

    // Deactivate variants not in the incoming payload
    await prisma.productVariant.updateMany({
      where: {
        productId: id,
        id: { notIn: activeIncomingIds }
      },
      data: { isActive: false }
    })

    // Upsert each incoming variant
    for (const v of variants) {
      if (v.id) {
        // Update existing variant
        await prisma.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size || undefined,
            color: v.color || undefined,
            colorHex: v.colorHex || undefined,
            stockQuantity: v.stockQuantity !== undefined ? parseInt(v.stockQuantity) : undefined,
            priceOverride: v.priceOverride !== undefined ? (v.priceOverride ? parseFloat(v.priceOverride) : null) : undefined,
            sku: v.sku || undefined,
            isActive: v.isActive !== undefined ? v.isActive : true
          }
        })
      } else {
        // Create new variant
        await prisma.productVariant.create({
          data: {
            productId: id,
            size: v.size || "M",
            color: v.color || "Carbon Black",
            colorHex: v.colorHex || "#121212",
            stockQuantity: parseInt(v.stockQuantity) || 0,
            priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
            sku: v.sku || `LUR-${(slug || product.slug).toUpperCase()}-${(v.size || "M").toUpperCase()}-${Date.now()}`,
            isActive: true
          }
        })
      }
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: name || product.name,
      slug: slug || product.slug,
      tagline: tagline !== undefined ? tagline : product.tagline,
      description: description || product.description,
      basePrice: basePrice ? parseFloat(basePrice) : product.basePrice,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : product.thumbnailUrl,
      isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
      defaultRating: defaultRating !== undefined ? parseFloat(defaultRating) : product.defaultRating,
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
