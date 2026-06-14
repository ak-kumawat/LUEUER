// src/routes/upload.routes.js
import { Router } from "express";
import asyncHandler from "../util/asyncHandler.js";
import { requireAuth } from "../middlewares/clerkAuth.js";
import { adminOnly } from "../middlewares/adminOnly.js";
import { upload } from "../middlewares/multer.middleware.js"; // Multer middleware (disk storage)
import { uploadOnCloudinary } from "../util/cloudinary.js"; // Cloudinary helper that expects a local file path

const router = Router();

/**
 * POST /api/v1/upload
 * Admin‑only endpoint to receive a single image file, upload it to Cloudinary,
 * delete the temporary local copy, and return the secure URL.
 */
router.post(
  "/",
  requireAuth,
  adminOnly,
  upload.single("image"), // expects a multipart field named "image"
  asyncHandler(async (req, res) => {
    // Multer stores the file on disk under ./public/temp and adds `req.file`
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // `req.file.path` is the absolute path to the temporary file
    const result = await uploadOnCloudinary(req.file.path);
    if (!result) {
      return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }

    // Cloudinary response contains `secure_url`
    return res.status(201).json({ success: true, url: result.secure_url });
  })
);

export default router;
