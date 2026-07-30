import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  eslint: {
    // "npm run check" runs eslint explicitly before the build step,
    // so the build itself does not need to repeat it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
