import { InventoryAction, ReservationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { metrics } from "./metrics.service.js";

/**
 * Finds reservations past their expiry, marks them EXPIRED, and puts stock back.
 * Safe to run from cron and from checkout validation — idempotent per reservation.
 */
export async function expireStaleReservations(): Promise<number> {
  const now = new Date();
  const stale = await prisma.reservation.findMany({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: { lte: now },
    },
    take: 100,
  });

  if (stale.length === 0) {
    return 0;
  }

  let expiredCount = 0;

  for (const reservation of stale) {
    try {
      await prisma.$transaction(async (tx) => {
        const current = await tx.reservation.findUnique({
          where: { id: reservation.id },
        });
        if (!current || current.status !== ReservationStatus.ACTIVE) {
          return;
        }
        if (current.expiresAt > now) {
          return;
        }

        const product = await tx.product.findUniqueOrThrow({
          where: { id: current.productId },
        });
        const stockBefore = product.availableStock;
        const stockAfter = stockBefore + current.quantity;

        await tx.product.update({
          where: { id: product.id },
          data: { availableStock: stockAfter },
        });

        await tx.reservation.update({
          where: { id: current.id },
          data: { status: ReservationStatus.EXPIRED },
        });

        await tx.inventoryLog.create({
          data: {
            productId: product.id,
            action: InventoryAction.RELEASE,
            delta: current.quantity,
            stockBefore,
            stockAfter,
            referenceId: current.id,
            note: "Reservation expired — stock returned to pool",
          },
        });
      });
      expiredCount += 1;
    } catch (err) {
      logger.error({ err, reservationId: reservation.id }, "Failed to expire reservation");
    }
  }

  if (expiredCount > 0) {
    metrics.incrementExpiry(expiredCount);
    logger.info({ count: expiredCount }, "Expired stale reservations");
  }

  return expiredCount;
}
