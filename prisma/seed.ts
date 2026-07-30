import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PRODUCTION_SEED !== "true"
  ) {
    throw new Error(
      "Production seed is disabled. Set ALLOW_PRODUCTION_SEED=true only for an intentional seed.",
    );
  }

  console.log("Seeding database...");

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { type: "ADMIN" },
    update: {},
    create: { name: "Admin", type: "ADMIN" },
  });
  await prisma.role.upsert({
    where: { type: "STAFF" },
    update: {},
    create: { name: "Staff", type: "STAFF" },
  });
  const customerRole = await prisma.role.upsert({
    where: { type: "CUSTOMER" },
    update: {},
    create: { name: "Customer", type: "CUSTOMER" },
  });

  // 2. Users
  // FLOF PITFALL: credentials sign-in requires emailVerified to be set
  // (see src/auth.ts). Seeded accounts are created by whoever runs db:seed,
  // so they are verified by construction. Without this stamp the README
  // credentials cannot log in at all. It is set on `update` too, so
  // re-running the seed backfills databases seeded before this fix.
  const seededEmailVerified = new Date();

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { emailVerified: seededEmailVerified },
    create: {
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 12),
      name: "Starter Admin",
      emailVerified: seededEmailVerified,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { emailVerified: seededEmailVerified },
    create: {
      email: "customer@example.com",
      password: await bcrypt.hash("customer123", 12),
      name: "Starter Customer",
      emailVerified: seededEmailVerified,
      roleId: customerRole.id,
    },
  });

  // 3. Products (neutral demo catalog, prices in smallest currency unit)
  const products = [
    { sku: "SKU-0001", slug: "basic-widget", name: "Basic Widget", price: 150000, stock: 50 },
    { sku: "SKU-0002", slug: "standard-widget", name: "Standard Widget", price: 290000, stock: 35 },
    { sku: "SKU-0003", slug: "premium-widget", name: "Premium Widget", price: 590000, stock: 20 },
    { sku: "SKU-0004", slug: "starter-kit", name: "Starter Kit", price: 990000, stock: 10 },
    { sku: "SKU-0005", slug: "spare-part-a", name: "Spare Part A", price: 45000, stock: 200 },
    { sku: "SKU-0006", slug: "limited-bundle", name: "Limited Bundle", price: 1490000, stock: 3 },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { price: p.price },
      create: { ...p, description: `Demo product ${p.name}`, isActive: true },
    });
  }

  // 4. Coupon with a usage limit, to exercise the conditional increment path
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 100000,
      usageLimit: 100,
      isActive: true,
    },
  });

  console.log("Seed completed.");
  console.log("  admin@example.com / admin123 (verified)");
  console.log("  customer@example.com / customer123 (verified)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
