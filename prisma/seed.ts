import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PRODUCTION_SEED !== "true"
  ) {
    throw new Error(
      "Production seed is disabled. Set ALLOW_PRODUCTION_SEED=true only for an intentional seed.",
    );
  }

  console.log("Seeding Aurora Hotel P0 database...");

  // 1. Roles
  const roles = [
    { type: "GUEST", name: "Guest" },
    { type: "RECEPTIONIST", name: "Receptionist" },
    { type: "HOUSEKEEPER", name: "Housekeeper" },
    { type: "MANAGER", name: "Manager" },
    { type: "ADMIN", name: "Administrator" },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { type: r.type },
      update: { name: r.name },
      create: { type: r.type, name: r.name },
    });
    roleMap[r.type] = role.id;
  }

  // 2. Users
  const seededEmailVerified = new Date();
  const defaultUsers = [
    {
      email: "admin@aurorahotel.com",
      password: "Admin123!",
      name: "Aurora Admin",
      phone: "+84901234567",
      roleId: roleMap["ADMIN"],
    },
    {
      email: "receptionist@aurorahotel.com",
      password: "Staff123!",
      name: "Front Desk Receptionist",
      phone: "+84901234568",
      roleId: roleMap["RECEPTIONIST"],
    },
    {
      email: "housekeeper@aurorahotel.com",
      password: "Staff123!",
      name: "Housekeeper Staff",
      phone: "+84901234569",
      roleId: roleMap["HOUSEKEEPER"],
    },
    {
      email: "guest@aurorahotel.com",
      password: "Guest123!",
      name: "Valued Guest",
      phone: "+84907654321",
      roleId: roleMap["GUEST"],
    },
  ];

  for (const u of defaultUsers) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        emailVerified: seededEmailVerified,
        roleId: u.roleId,
      },
      create: {
        email: u.email,
        password: hashedPassword,
        name: u.name,
        phone: u.phone,
        emailVerified: seededEmailVerified,
        roleId: u.roleId,
      },
    });
  }

  // 3. Room Categories
  const categories = [
    {
      slug: "deluxe-king",
      type: "DELUXE_KING",
      name: "Deluxe King Room",
      description: "Spacious 35sqm room featuring a plush King bed, panoramic city view, and luxury marble bathroom.",
      basePrice: 2500000,
      maxOccupancy: 2,
      sizeSqm: 35,
      bedConfiguration: "1 King Bed",
      amenities: ["King Bed", "City View", "Free Wi-Fi", "Bathtub", "Smart TV", "Mini Bar", "Espresso Machine"],
      images: [
        "/images/aurora/deluxe-king.jpg",
        "/images/aurora/hero-01.jpg",
      ],
    },
    {
      slug: "deluxe-twin",
      type: "DELUXE_TWIN",
      name: "Deluxe Twin Room",
      description: "Elegant 38sqm room with two single beds, ideal for travelers or friends seeking supreme comfort.",
      basePrice: 2700000,
      maxOccupancy: 2,
      sizeSqm: 38,
      bedConfiguration: "2 Single Beds",
      amenities: ["2 Twin Beds", "City View", "Free Wi-Fi", "Rain Shower", "Work Desk", "Mini Bar"],
      images: [
        "/images/aurora/deluxe-king.jpg",
        "/images/aurora/hero-02.jpg",
      ],
    },
    {
      slug: "executive-suite",
      type: "EXECUTIVE_SUITE",
      name: "Executive Suite",
      description: "Luxurious 65sqm suite with a separate living area, private balcony, and Executive Lounge privileges.",
      basePrice: 4500000,
      maxOccupancy: 3,
      sizeSqm: 65,
      bedConfiguration: "1 Super King Bed",
      amenities: ["Super King Bed", "Living Room", "Private Balcony", "Executive Lounge", "Jacuzzi", "Ocean View"],
      images: [
        "/images/aurora/executive-suite.jpg",
        "/images/aurora/hero-03.jpg",
      ],
    },
    {
      slug: "presidential-suite",
      type: "PRESIDENTIAL_SUITE",
      name: "Presidential Suite",
      description: "Unrivaled 120sqm penthouse sanctuary featuring 24/7 butler service, private dining room, and 360-degree ocean views.",
      basePrice: 12000000,
      maxOccupancy: 4,
      sizeSqm: 120,
      bedConfiguration: "1 Emperor King Bed + 1 King Bed",
      amenities: ["Emperor Bed", "2 Bedrooms", "Butler Service", "Private Dining", "Sauna & Spa", "Panoramic Ocean View"],
      images: [
        "/images/aurora/presidential-villa.jpg",
        "/images/aurora/family-villa.jpg",
      ],
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.roomCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        basePrice: cat.basePrice,
        amenities: cat.amenities,
        images: cat.images,
      },
      create: cat,
    });
    categoryMap[cat.type] = created.id;
  }

  // 4. Rate Plans
  const ratePlans = [
    {
      code: "FLEX-BFAST",
      name: "Flexible Rate with Gourmet Breakfast",
      planType: "FLEXIBLE_BREAKFAST",
      priceMultiplier: 1.0,
      cancelPolicyDays: 3,
      breakfastIncluded: true,
    },
    {
      code: "NON-REF",
      name: "Non-Refundable Saver",
      planType: "NON_REFUNDABLE",
      priceMultiplier: 0.85,
      cancelPolicyDays: 0,
      breakfastIncluded: false,
    },
    {
      code: "EXT-STAY",
      name: "Extended Stay Special (3+ Nights)",
      planType: "EXTENDED_STAY_PROMO",
      priceMultiplier: 0.80,
      cancelPolicyDays: 7,
      breakfastIncluded: true,
    },
  ];

  for (const catType of Object.keys(categoryMap)) {
    const catId = categoryMap[catType];
    for (const rp of ratePlans) {
      const uniqueCode = `${rp.code}-${catType}`;
      await prisma.ratePlan.upsert({
        where: { code: uniqueCode },
        update: {
          name: `${rp.name} - ${catType}`,
          priceMultiplier: rp.priceMultiplier,
        },
        create: {
          code: uniqueCode,
          name: `${rp.name} - ${catType}`,
          roomCategoryId: catId,
          planType: rp.planType,
          priceMultiplier: rp.priceMultiplier,
          cancelPolicyDays: rp.cancelPolicyDays,
          breakfastIncluded: rp.breakfastIncluded,
        },
      });
    }
  }

  // 5. Rooms (10 rooms per category)
  const roomPrefixes: Record<string, number> = {
    DELUXE_KING: 100,
    DELUXE_TWIN: 200,
    EXECUTIVE_SUITE: 300,
    PRESIDENTIAL_SUITE: 400,
  };

  for (const catType of Object.keys(categoryMap)) {
    const catId = categoryMap[catType];
    const prefix = roomPrefixes[catType];
    for (let i = 1; i <= 10; i++) {
      const roomNum = String(prefix + i);
      const floor = Math.floor((prefix + i) / 100);
      await prisma.room.upsert({
        where: { number: roomNum },
        update: { status: "CLEAN" },
        create: {
          number: roomNum,
          roomCategoryId: catId,
          floor,
          status: "CLEAN",
        },
      });
    }
  }

  // 6. Day Availability (Next 90 Days)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const catType of Object.keys(categoryMap)) {
    const catId = categoryMap[catType];
    for (let day = 0; day < 90; day++) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() + day);

      await prisma.dayAvailability.upsert({
        where: {
          roomCategoryId_date: {
            roomCategoryId: catId,
            date,
          },
        },
        update: { totalInventory: 10 },
        create: {
          roomCategoryId: catId,
          date,
          totalInventory: 10,
          bookedCount: 0,
          holdCount: 0,
          version: 0,
        },
      });
    }
  }

  console.log("Aurora Hotel P0 seed completed cleanly.");
  console.log("  admin@aurorahotel.com / Admin123!");
  console.log("  receptionist@aurorahotel.com / Staff123!");
  console.log("  housekeeper@aurorahotel.com / Staff123!");
  console.log("  guest@aurorahotel.com / Guest123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
