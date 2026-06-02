import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

// Single Prisma instance for the process — connection pooling lives here
export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
