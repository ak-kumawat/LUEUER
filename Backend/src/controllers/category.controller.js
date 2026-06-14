import prisma from "../db/index.js";
import { asyncHandler } from "../util/asyncHandler.js";

/**
 * GET /api/v1/categories
 * Public – returns every category (includes its products)
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { products: true }, // eager‑load products (optional)
  });
  res.json({ success: true, data: categories });
});

/**
 * GET /api/v1/categories/:id
 * Public – single category by numeric id
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { products: true },
  });

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }

  res.json({ success: true, data: category });
});

/**
 * POST /api/v1/categories
 * Admin‑only – creates a new category
 * Expected JSON body: { name, slug, description? }
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;

  if (!name || !slug) {
    return res
      .status(400)
      .json({ success: false, message: "Name and slug are required" });
  }

  const newCat = await prisma.category.create({
    data: { name, slug, description },
  });

  res.status(201).json({ success: true, data: newCat });
});

/**
 * PUT /api/v1/categories/:id
 * Admin‑only – updates an existing category
 * Expected JSON body: { name?, slug?, description? }
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  const updated = await prisma.category.update({
    where: { id: Number(id) },
    data: { name, slug, description },
  });

  res.json({ success: true, data: updated });
});

/**
 * DELETE /api/v1/categories/:id
 * Admin‑only – removes a category (hard delete)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id: Number(id) } });

  res.json({ success: true, message: "Category deleted" });
});