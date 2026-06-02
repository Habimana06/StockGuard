import cron from "node-cron";
import { expireStaleReservations } from "../services/expiry.service.js";
import { logger } from "../lib/logger.js";

/** Runs every minute — releases stock from reservations that timed out */
export function startExpiryCron(): void {
  cron.schedule("* * * * *", async () => {
    try {
      await expireStaleReservations();
    } catch (err) {
      logger.error({ err }, "Expiry cron run failed");
    }
  });
  logger.info("Reservation expiry cron scheduled (every minute)");
}
