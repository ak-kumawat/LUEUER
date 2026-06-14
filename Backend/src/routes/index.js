// src/routes/index.js
import { Router } from "express";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";

const router = Router();

// Base health endpoint
router.get("/", (req, res) => {
  res.json({ message: "LUEUER API v1 – online" });
});

// Simple health‑check – returns { status: "ok" }
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
// Mount feature routers
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

export default router;