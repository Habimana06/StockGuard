import { PrismaClient, InventoryAction } from "@prisma/client";

const prisma = new PrismaClient();

const DROP_PRODUCT = {
  name: "CloudBuds Pro — White Edition",
  description:
    "Matte white finish, active noise canceling, 32-hour battery. Only 10 units in this drop — reserve to hold yours for 5 minutes.",
  imageUrl:
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&auto=format&fit=crop&q=80",
  priceCents: 8999,
  totalStock: 10,
  availableStock: 10,
};

async function main() {
  const existing = await prisma.product.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: DROP_PRODUCT,
    });
    console.log(`Updated drop product ${existing.id}`);
    return;
  }

  const product = await prisma.product.create({ data: DROP_PRODUCT });

  await prisma.inventoryLog.create({
    data: {
      productId: product.id,
      action: InventoryAction.SEED,
      delta: 10,
      stockBefore: 0,
      stockAfter: 10,
      note: "Initial inventory for limited drop",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@stockguard.local" },
    update: {},
    create: {
      email: "demo@stockguard.local",
      passwordHash: "$2a$10$placeholder-not-for-login",
      displayName: "Demo Shopper",
    },
  });

  console.log(`Seeded product ${product.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
