// src/routes/product.routes.js
import { Router } from "express";
import asyncHandler from "../util/asyncHandler.js";
import { requireAuth } from "../middlewares/clerkAuth.js";
import { adminOnly } from "../middlewares/adminOnly.js";

import {
  getAllProducts,
  getProductBySlug,
  createProduct,
} from "../controllers/product.controller.js";

const router = Router();

/* ---------------------- Public read routes ---------------------- */
router.get("/", getAllProducts);
router.get("/slug/:slug", getProductBySlug);

/* ---------------------- Authenticated routes ------------------- */
// No public product‑creation – only admins can create products.
// If you ever want a regular‑user create‑product endpoint, add another route here.
router.post("/", requireAuth, asyncHandler(createProduct)); // (optional – comment out if you never allow users)

/* ---------------------- Admin‑only routes ----------------------- */
// Admin creates/updates/deletes products.
router.post("/admin", adminOnly, asyncHandler(createProduct));

export default router;