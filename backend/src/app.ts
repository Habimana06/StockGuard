import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.routes.js";
import { metricsRouter } from "./routes/metrics.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { reservationRouter } from "./routes/reservation.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { metrics } from "./services/metrics.service.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "32kb" }));

  app.use(
    pinoHttp({
      logger,
      customSuccessMessage(req: { method: string; url: string }, res: { statusCode: number }) {
        return `${req.method} ${req.url} → ${res.statusCode}`;
      },
    })
  );

  app.use((_req, _res, next) => {
    metrics.incrementHttp();
    next();
  });

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests — slow down", code: "RATE_LIMIT" },
  });
  app.use(limiter);

  const reserveLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "Reservation rate limit exceeded", code: "RATE_LIMIT" },
  });

  app.use(healthRouter);
  app.use(metricsRouter);
  app.use(authRouter);
  app.use(productRouter);
  app.use("/api", reserveLimiter, reservationRouter);

  app.use(errorHandler);

  return app;
}
