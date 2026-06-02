import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { optionalAuth, resolveUserId, requireUser } from "../middleware/auth.js";
import {
  checkoutReservation,
  reserveProduct,
} from "../services/reservation.service.js";
import { checkoutBodySchema, reserveBodySchema } from "../validators/schemas.js";

export const reservationRouter = Router();

reservationRouter.use(optionalAuth, resolveUserId, requireUser);

reservationRouter.post(
  "/reserve",
  validate(reserveBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as { productId: string; quantity: number };
    const result = await reserveProduct({
      userId: req.auth!.userId,
      productId: body.productId,
      quantity: body.quantity,
    });
    res.status(201).json(result);
  })
);

reservationRouter.post(
  "/checkout",
  validate(checkoutBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as { reservationId: string };
    const result = await checkoutReservation({
      userId: req.auth!.userId,
      reservationId: body.reservationId,
    });
    res.status(201).json(result);
  })
);
