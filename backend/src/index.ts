import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { startExpiryCron } from "./jobs/expiryCron.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function main() {
  await prisma.$connect();
  startExpiryCron();

  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, ttlMinutes: env.RESERVATION_TTL_MINUTES },
      "StockGuard API listening"
    );
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
