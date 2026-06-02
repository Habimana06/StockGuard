import { Router } from "express";
import { metrics } from "../services/metrics.service.js";

export const metricsRouter = Router();

metricsRouter.get("/metrics", (_req, res) => {
  res.json({
    service: "stockguard-api",
    counters: metrics.snapshot(),
    collectedAt: new Date().toISOString(),
  });
});
