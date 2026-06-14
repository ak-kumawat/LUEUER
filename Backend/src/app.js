import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkAuth } from "./middlewares/clerkAuth.js";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import apiRouter from "./routes/index.js";

const app = express();

// ------------------- Core middle‑wares -------------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ------------------- Security -------------------
app.use(helmet());
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // per IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ------------------- Auth -------------------
app.use(clerkAuth); // sets req.user & req.isAdmin

// ------------------- API routes -------------------
app.use("/api/v1", apiRouter);

// ------------------- Global error handler -------------------
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
