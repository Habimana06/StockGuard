import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import {
  getProductById,
  getActiveReservationForUser,
  listProducts,
} from "../services/reservation.service.js";
import { productIdParamSchema, productListQuerySchema } from "../validators/schemas.js";
import { optionalAuth, resolveUserId } from "../middleware/auth.js";

export const productRouter = Router();

productRouter.get(
  "/products",
  validate(productListQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await listProducts(req.query as never);
    res.json(result);
  })
);

productRouter.get(
  "/products/:id",
  validate(productIdParamSchema, "params"),
  optionalAuth,
  resolveUserId,
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const product = await getProductById(id);
    let activeReservation = null;
    if (req.auth?.userId) {
      activeReservation = await getActiveReservationForUser(req.auth.userId, id);
    }
    res.json({
      product,
      activeReservation,
    });
  })
);
