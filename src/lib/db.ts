if (typeof window !== "undefined") {
  throw new Error("Database client cannot be imported in client components");
}
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { readRuntimeEnvironment } from "../server/config/environment.ts";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const environment = readRuntimeEnvironment(process.env);
  const adapter = new PrismaNeon({
    connectionString: environment.databaseUrl,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createClient();
    }
    const instance = globalForPrisma.prisma as any;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
