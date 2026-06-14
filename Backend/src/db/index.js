import { PrismaClient } from "../generated/prisma/index.js";

let prisma;

// In dev (nodemon) we want a single instance to avoid “multiple instances” warnings.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma__) {
    global.__prisma__ = new PrismaClient();
  }
  prisma = global.__prisma__;
}

export default prisma;
