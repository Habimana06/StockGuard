import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { ReservationStatus } from "@prisma/client";
import { seedTestProduct } from "./setup.js";
import { reserveProduct, checkoutReservation } from "../services/reservation.service.js";
import { expireStaleReservations } from "../services/expiry.service.js";

const app = createApp();

describe("POST /api/reserve", () => {
  it("holds stock and returns reservation id", async () => {
    const { user, product } = await seedTestProduct(3);

    const res = await request(app)
      .post("/api/reserve")
      .set("X-Guest-Id", `guest-${user.id}`)
      .send({ productId: product.id, quantity: 1 });

    expect(res.status).toBe(201);
    expect(res.body.reservationId).toBeDefined();
    expect(res.body.remainingStock).toBe(2);

    const updated = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(updated.availableStock).toBe(2);
  });

  it("rejects duplicate active reservation for same user and product", async () => {
    const { user, product } = await seedTestProduct(5);

    const guest = `dup-${user.id}`;
    await request(app)
      .post("/api/reserve")
      .set("X-Guest-Id", guest)
      .send({ productId: product.id, quantity: 1 });

    const second = await request(app)
      .post("/api/reserve")
      .set("X-Guest-Id", guest)
      .send({ productId: product.id, quantity: 1 });

    expect(second.status).toBe(409);
  });
});

describe("Concurrency", () => {
  it("never oversells when many users reserve at once", async () => {
    const stock = 10;
    const { product } = await seedTestProduct(stock);
    const attempts = 25;

    const users = await Promise.all(
      Array.from({ length: attempts }, (_, i) =>
        prisma.user.create({
          data: {
            email: `race-${i}-${Date.now()}@test.local`,
            passwordHash: "x",
          },
        })
      )
    );

    const results = await Promise.allSettled(
      users.map((u) =>
        reserveProduct({
          userId: u.id,
          productId: product.id,
          quantity: 1,
        })
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    expect(succeeded).toBe(stock);
    expect(failed).toBe(attempts - stock);

    const finalProduct = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(finalProduct.availableStock).toBe(0);
    expect(finalProduct.availableStock).toBeGreaterThanOrEqual(0);
  });
});

describe("Expiration", () => {
  it("restores stock when reservation expires", async () => {
    const { user, product } = await seedTestProduct(2);

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 1,
        status: ReservationStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { availableStock: 1 },
    });

    const count = await expireStaleReservations();
    expect(count).toBe(1);

    const after = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.availableStock).toBe(2);

    const updatedRes = await prisma.reservation.findUniqueOrThrow({
      where: { id: reservation.id },
    });
    expect(updatedRes.status).toBe(ReservationStatus.EXPIRED);
  });
});

describe("POST /api/checkout", () => {
  it("converts a valid reservation into an order", async () => {
    const { user, product } = await seedTestProduct(1);
    const held = await reserveProduct({
      userId: user.id,
      productId: product.id,
      quantity: 1,
    });

    const order = await checkoutReservation({
      userId: user.id,
      reservationId: held.reservationId,
    });

    expect(order.orderId).toBeDefined();
    expect(order.totalCents).toBe(product.priceCents);

    const reservation = await prisma.reservation.findUniqueOrThrow({
      where: { id: held.reservationId },
    });
    expect(reservation.status).toBe(ReservationStatus.COMPLETED);
  });
});
