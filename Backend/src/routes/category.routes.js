// src/routes/category.routes.js
import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { adminOnly } from "../middlewares/adminOnly.js";

const router = Router();

// Public read endpoints
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin‑only mutating endpoints
router.post("/", adminOnly, createCategory);
router.put("/:id", adminOnly, updateCategory);
router.delete("/:id", adminOnly, deleteCategory);

export default router;