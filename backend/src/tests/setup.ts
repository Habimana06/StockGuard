import { beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../lib/prisma.js";
import { InventoryAction } from "@prisma/client";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.inventoryLog.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});

export async function seedTestProduct(stock = 5) {
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@test.local`,
      passwordHash: "test",
    },
  });
  const product = await prisma.product.create({
    data: {
      name: "Test Drop",
      priceCents: 5000,
      totalStock: stock,
      availableStock: stock,
    },
  });
  await prisma.inventoryLog.create({
    data: {
      productId: product.id,
      action: InventoryAction.SEED,
      delta: stock,
      stockBefore: 0,
      stockAfter: stock,
    },
  });
  return { user, product };
}
