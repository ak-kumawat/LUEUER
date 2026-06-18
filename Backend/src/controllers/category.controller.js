import prisma from '../db/index.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: { children: true }
  })

  return res.status(200).json(
    new ApiResponse(200, categories, "Categories fetched")
  )
})

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: true,
      products: {
        include: {
          product: {
            include: {
              images: true,
              variants: true
            }
          }
        }
      }
    }
  })

  if (!category) {
    throw new ApiError(404, "Category not found")
  }

  return res.status(200).json(
    new ApiResponse(200, category, "Category fetched")
  )
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, type, parentId, description, imageUrl, displayOrder } = req.body

  if (!name || !slug || !type) {
    throw new ApiError(400, "Name, slug and type are required")
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    throw new ApiError(409, "Category with this slug already exists")
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      type,
      parentId: parentId || null,
      description: description || null,
      imageUrl: imageUrl || null,
      displayOrder: displayOrder || 0
    }
  })

  return res.status(201).json(
    new ApiResponse(201, category, "Category created")
  )
})

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, slug, type, parentId, description, imageUrl, isActive, displayOrder } = req.body

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    throw new ApiError(404, "Category not found")
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: name || category.name,
      slug: slug || category.slug,
      type: type || category.type,
      parentId: parentId !== undefined ? parentId : category.parentId,
      description: description !== undefined ? description : category.description,
      imageUrl: imageUrl !== undefined ? imageUrl : category.imageUrl,
      isActive: isActive !== undefined ? isActive : category.isActive,
      displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder
    }
  })

  return res.status(200).json(
    new ApiResponse(200, updated, "Category updated")
  )
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    throw new ApiError(404, "Category not found")
  }

  await prisma.category.update({
    where: { id },
    data: { isActive: false }
  })

  return res.status(200).json(
    new ApiResponse(200, null, "Category deactivated")
  )
})
