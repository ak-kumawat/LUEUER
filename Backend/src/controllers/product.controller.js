import prisma from "../db/index.js";
import { asyncHandler } from "../util/asyncHandler.js";

/**
 * GET /api/v1/products
 * Public – list all products (with their category)
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
  });
  res.json({ success: true, data: products });
});

/**
 * GET /api/v1/products/slug/:slug
 * Public – find a product by its slug
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
});

/**
 * POST /api/v1/products
 * Admin‑only – create a new product
 * Expected JSON body:
 * {
 *   name,
 *   slug,
 *   description?,   // optional
 *   price,           // numeric or string that can be parsed as Decimal
 *   imageUrl?,       // optional
 *   categoryId?      // optional – must refer to an existing Category.id
 * }
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    description,
    price,
    imageUrl,
    categoryId, // may be undefined
  } = req.body;

  // Basic validation
  if (!name || !slug || price == null) {
    return res.status(400).json({
      success: false,
      message: "Name, slug and price are required",
    });
  }

  try {
    const newProd = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        imageUrl,
        // Connect to an existing category if the client supplied one
        category:
          categoryId != null
            ? { connect: { id: Number(categoryId) } }
            : undefined,
      },
    });

    res.status(201).json({ success: true, data: newProd });
  } catch (e) {
    // Prisma’s unique‑constraint violation code
    if (e.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Slug already exists" });
    }
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});