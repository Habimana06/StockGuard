import { z } from "zod";

export const reserveBodySchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).max(10),
});

export const checkoutBodySchema = z.object({
  reservationId: z.string().cuid(),
});

export const authRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(64).optional(),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z
    .enum(["name", "priceCents", "availableStock", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  minStock: z.coerce.number().int().min(0).optional(),
  search: z.string().min(1).max(100).optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().cuid(),
});
