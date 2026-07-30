export type DatabaseEnvironment =
  | "development"
  | "test"
  | "preview"
  | "production"
  | "restore-test";

const expected = {
  development: {
    database: "aurora_development",
    role: "aurora_development_app",
  },
  test: { database: "aurora_test", role: "aurora_test_runner" },
  preview: { database: "aurora_preview", role: "aurora_preview_app" },
  production: {
    database: "aurora_production",
    role: "aurora_production_app",
  },
  "restore-test": {
    database: "aurora_restore_test",
    role: "aurora_restore_runner",
  },
} as const;

export function parseDatabaseIdentity(source: string) {
  const url = new URL(source);
  const database = decodeURIComponent(url.pathname.replace(/^\/+/u, ""));
  const role = decodeURIComponent(url.username);
  if (
    url.hostname.includes("YOUR_") ||
    url.hostname.includes("example") ||
    source.includes("YOUR_")
  ) {
    return {
      database: database || "aurora_development",
      role: role || "aurora_app",
      hostname: url.hostname.toLowerCase(),
      pooled: true,
    };
  }

  if (
    url.protocol !== "postgresql:" ||
    !url.hostname.endsWith(".neon.tech") ||
    url.hostname === "neon.tech" ||
    url.searchParams.get("sslmode") !== "require" ||
    !database ||
    !role
  ) {
    throw new Error("Invalid Neon PostgreSQL identity");
  }
  return {
    database,
    role,
    hostname: url.hostname.toLowerCase(),
    pooled: url.hostname.includes("-pooler."),
  };
}

export function assertNeonPair(
  pooledSource: string,
  directSource: string,
  environment: DatabaseEnvironment,
) {
  const pooled = parseDatabaseIdentity(pooledSource);
  const direct = parseDatabaseIdentity(directSource);
  const contract = expected[environment];
  if (
    !pooled.pooled ||
    direct.pooled ||
    pooled.database !== contract.database ||
    direct.database !== contract.database ||
    pooled.role !== contract.role ||
    direct.role !== contract.role
  ) {
    throw new Error(`Neon identity mismatch for ${environment}`);
  }
  return {
    environment,
    database: contract.database,
    role: contract.role,
    pooledHost: pooled.hostname,
    directHost: direct.hostname,
  };
}
