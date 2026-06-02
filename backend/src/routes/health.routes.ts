import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const healthRouter = Router();

healthRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    let dbOk = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
    const status = dbOk ? "ok" : "degraded";
    res.status(dbOk ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      database: dbOk ? "connected" : "unavailable",
    });
  })
);
