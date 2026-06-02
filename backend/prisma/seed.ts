import { PrismaClient, InventoryAction } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.product.findFirst({
    where: { name: "Limited Drop Sneaker" },
  });

  if (existing) {
    console.log("Seed already applied — skipping.");
    return;
  }

  const product = await prisma.product.create({
    data: {
      name: "Limited Drop Sneaker",
      description:
        "Exclusive release — only a handful in stock. Reserve within 5 minutes to secure yours.",
      priceCents: 12999,
      totalStock: 10,
      availableStock: 10,
    },
  });

  await prisma.inventoryLog.create({
    data: {
      productId: product.id,
      action: InventoryAction.SEED,
      delta: 10,
      stockBefore: 0,
      stockAfter: 10,
      note: "Initial inventory for demo drop",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@stockguard.local" },
    update: {},
    create: {
      email: "demo@stockguard.local",
      passwordHash: "$2a$10$placeholder-not-for-login",
      displayName: "Demo Shopper",
    },
  });

  console.log(`Seeded product ${product.id} and demo user ${demoUser.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
