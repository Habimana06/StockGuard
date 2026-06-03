import { z } from "zod";

export const reserveBodySchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).max(10),
});

const last4 = z.string().length(4).regex(/^\d{4}$/, "Last 4 digits required");

export const checkoutBodySchema = z.discriminatedUnion("method", [
  z.object({
    reservationId: z.string().cuid(),
    method: z.literal("CARD"),
    cardHolder: z.string().min(2).max(80),
    cardLast4: last4,
    cardBrand: z.enum(["visa", "mastercard", "amex", "other"]).optional(),
  }),
  z.object({
    reservationId: z.string().cuid(),
    method: z.literal("BANK"),
    accountHolder: z.string().min(2).max(80),
    bankName: z.string().min(2).max(80),
    accountLast4: last4,
  }),
  z.object({
    reservationId: z.string().cuid(),
    method: z.literal("MOBILE"),
    accountHolder: z.string().min(2).max(80),
    provider: z.string().min(2).max(40),
    phoneLast4: last4,
  }),
]);

export type CheckoutBody = z.infer<typeof checkoutBodySchema>;

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
