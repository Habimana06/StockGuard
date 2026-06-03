import {
  InventoryAction,
  PaymentMethod,
  ReservationStatus,
  type Prisma,
} from "@prisma/client";
import type { CheckoutBody } from "../validators/schemas.js";
import { prisma } from "../lib/prisma.js";
import { reservationExpiresAt } from "../config/env.js";
import { ConflictError, NotFoundError, ValidationError } from "../types/errors.js";
import { expireStaleReservations } from "./expiry.service.js";
import { metrics } from "./metrics.service.js";

export interface ReserveInput {
  userId: string;
  productId: string;
  quantity: number;
}

export interface ReserveResult {
  reservationId: string;
  expiresAt: Date;
  productId: string;
  quantity: number;
  remainingStock: number;
}

export async function reserveProduct(input: ReserveInput): Promise<ReserveResult> {
  if (input.quantity < 1) {
    throw new ValidationError("Quantity must be at least 1");
  }

  // Clear expired holds first so stock numbers stay honest
  await expireStaleReservations();

  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });
      if (!product) {
        throw new NotFoundError("Product not found");
      }

      const activeDuplicate = await tx.reservation.findFirst({
        where: {
          userId: input.userId,
          productId: input.productId,
          status: ReservationStatus.ACTIVE,
          expiresAt: { gt: new Date() },
        },
      });
      if (activeDuplicate) {
        metrics.incrementConflict();
        throw new ConflictError(
          "You already have an active reservation for this product"
        );
      }

      // Atomic decrement — if availableStock < quantity, count stays 0 and we reject
      const updated = await tx.product.updateMany({
        where: {
          id: input.productId,
          availableStock: { gte: input.quantity },
        },
        data: {
          availableStock: { decrement: input.quantity },
        },
      });

      if (updated.count === 0) {
        metrics.incrementConflict();
        throw new ConflictError("Not enough stock available");
      }

      const refreshed = await tx.product.findUniqueOrThrow({
        where: { id: input.productId },
      });

      const expiresAt = reservationExpiresAt();
      const reservation = await tx.reservation.create({
        data: {
          userId: input.userId,
          productId: input.productId,
          quantity: input.quantity,
          status: ReservationStatus.ACTIVE,
          expiresAt,
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId: input.productId,
          action: InventoryAction.RESERVE,
          delta: -input.quantity,
          stockBefore: refreshed.availableStock + input.quantity,
          stockAfter: refreshed.availableStock,
          referenceId: reservation.id,
          note: "Stock held for reservation",
        },
      });

      metrics.incrementReservation();

      return {
        reservationId: reservation.id,
        expiresAt: reservation.expiresAt,
        productId: product.id,
        quantity: input.quantity,
        remainingStock: refreshed.availableStock,
      };
    });
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ConflictError || err instanceof ValidationError) {
      throw err;
    }
    throw err;
  }
}

export interface CheckoutInput {
  userId: string;
  payment: CheckoutBody;
}

export interface CheckoutResult {
  orderId: string;
  reservationId: string;
  totalCents: number;
  paymentMethod: PaymentMethod;
  paymentLabel: string;
}

function buildPaymentMeta(payment: CheckoutBody): {
  method: PaymentMethod;
  label: string;
} {
  switch (payment.method) {
    case "CARD":
      return {
        method: PaymentMethod.CARD,
        label: `${payment.cardBrand ?? "Card"} ···· ${payment.cardLast4} (${payment.cardHolder})`,
      };
    case "BANK":
      return {
        method: PaymentMethod.BANK,
        label: `${payment.bankName} ···· ${payment.accountLast4} (${payment.accountHolder})`,
      };
    case "MOBILE":
      return {
        method: PaymentMethod.MOBILE,
        label: `${payment.provider} ···· ${payment.phoneLast4} (${payment.accountHolder})`,
      };
  }
}

export async function checkoutReservation(input: CheckoutInput): Promise<CheckoutResult> {
  const reservationId = input.payment.reservationId;
  const { method, label } = buildPaymentMeta(input.payment);
  await expireStaleReservations();

  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { product: true, order: true },
    });

    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }
    if (reservation.userId !== input.userId) {
      throw new ConflictError("This reservation belongs to another user");
    }
    if (reservation.order) {
      throw new ConflictError("Reservation already checked out");
    }
    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new ConflictError(`Reservation is ${reservation.status.toLowerCase()}`);
    }
    if (reservation.expiresAt <= new Date()) {
      throw new ConflictError("Reservation has expired");
    }

    const totalCents = reservation.product.priceCents * reservation.quantity;

    const order = await tx.order.create({
      data: {
        userId: input.userId,
        productId: reservation.productId,
        reservationId: reservation.id,
        quantity: reservation.quantity,
        totalCents,
        paymentMethod: method,
        paymentLabel: label,
      },
    });

    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: ReservationStatus.COMPLETED },
    });

    await tx.inventoryLog.create({
      data: {
        productId: reservation.productId,
        action: InventoryAction.CHECKOUT,
        delta: 0,
        stockBefore: reservation.product.availableStock,
        stockAfter: reservation.product.availableStock,
        referenceId: order.id,
        note: "Checkout completed — reserved units sold",
      },
    });

    metrics.incrementCheckout();

    return {
      orderId: order.id,
      reservationId: reservation.id,
      totalCents,
      paymentMethod: method,
      paymentLabel: label,
    };
  });
}

export type ListProductsQuery = {
  page: number;
  limit: number;
  sortBy: "name" | "priceCents" | "availableStock" | "createdAt";
  sortOrder: "asc" | "desc";
  minStock?: number;
  search?: string;
};

export async function listProducts(query: ListProductsQuery) {
  const where: Prisma.ProductWhereInput = {};
  if (query.minStock !== undefined) {
    where.availableStock = { gte: query.minStock };
  }
  if (query.search) {
    // MySQL default collation is case-insensitive for utf8mb4_unicode_ci
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  return product;
}

export async function getActiveReservationForUser(userId: string, productId: string) {
  await expireStaleReservations();
  return prisma.reservation.findFirst({
    where: {
      userId,
      productId,
      status: ReservationStatus.ACTIVE,
      expiresAt: { gt: new Date() },
    },
  });
}
