import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ? env("DIRECT_URL") : "postgresql://aurora_test_runner:dummy@ep-test.us-east-2.aws.neon.tech/aurora_test?sslmode=require",
  },
});
