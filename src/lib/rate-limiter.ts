// Unified rate limiter, distilled from FLOF src/lib/rate-limiter.ts.
//
// - Dev / single instance: in-memory sliding window (Map of timestamps).
// - Production: Upstash Redis REST fixed window, auto-detected from
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
// - failureMode "deny" = FAIL CLOSED: if the distributed backend is missing
//   or unreachable, sensitive requests are rejected (503) instead of falling
//   back to per-instance memory. WHY: on serverless/multi-instance deploys an
//   in-memory limiter resets on every cold start and is trivially bypassed,
//   which would silently disable brute-force protection on login/checkout.
//
// DIVERGENCE vs FLOF: FLOF routes failures through an operational log module
// and a redis-environment resolver; the starter logs to console.error and
// reads process.env directly to stay dependency-free.

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  reason?: "BACKEND_UNAVAILABLE";
};

export class UnifiedRateLimiter {
  private store = new Map<string, number[]>();
  private windowMs: number;
  private maxLimit: number;
  private useRedis: boolean;
  private redisUrl?: string;
  private redisToken?: string;
  private failureMode: "memory" | "deny";

  constructor(
    windowMs: number,
    maxLimit: number,
    options: {
      failureMode?: "memory" | "deny";
      redisUrl?: string;
      redisToken?: string;
    } = {},
  ) {
    this.windowMs = windowMs;
    this.maxLimit = maxLimit;
    this.failureMode = options.failureMode ?? "memory";
    this.redisUrl = options.redisUrl ?? process.env.UPSTASH_REDIS_REST_URL;
    this.redisToken = options.redisToken ?? process.env.UPSTASH_REDIS_REST_TOKEN;
    this.useRedis = Boolean(this.redisUrl && this.redisToken);
  }

  async checkLimit(key: string): Promise<RateLimitResult> {
    if (this.useRedis) {
      try {
        return await this.checkRedisLimit(key);
      } catch (error) {
        console.error("[rate-limit] distributed backend unavailable:", error);
        if (this.failureMode === "deny") {
          return this.backendUnavailableResult();
        }
        return this.checkMemoryLimit(key);
      }
    }

    // No Redis configured at all: fail closed for "deny" buckets.
    if (this.failureMode === "deny") {
      return this.backendUnavailableResult();
    }

    return this.checkMemoryLimit(key);
  }

  private backendUnavailableResult(): RateLimitResult {
    return {
      success: false,
      limit: this.maxLimit,
      remaining: 0,
      resetTime: Date.now() + this.windowMs,
      reason: "BACKEND_UNAVAILABLE",
    };
  }

  private checkMemoryLimit(key: string): RateLimitResult {
    const now = Date.now();
    const timestamps = this.store.get(key) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    if (validTimestamps.length >= this.maxLimit) {
      this.store.set(key, validTimestamps);
      const oldestTimestamp = validTimestamps[0] || now;
      return {
        success: false,
        limit: this.maxLimit,
        remaining: 0,
        resetTime: oldestTimestamp + this.windowMs,
      };
    }

    validTimestamps.push(now);
    this.store.set(key, validTimestamps);
    return {
      success: true,
      limit: this.maxLimit,
      remaining: this.maxLimit - validTimestamps.length,
      resetTime: now + this.windowMs,
    };
  }

  private async checkRedisLimit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowSeconds = Math.ceil(this.windowMs / 1000);
    const currentWindowIndex = Math.floor(now / this.windowMs);
    const redisKey = `ratelimit:${key}:${currentWindowIndex}`;

    const response = await fetch(`${this.redisUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSeconds],
      ]),
      // Short timeout so a slow Redis cannot stall every request.
      signal: AbortSignal.timeout(1500),
    });

    if (!response.ok) {
      throw new Error(`Upstash Redis HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (
      !Array.isArray(data) ||
      data.length < 2 ||
      typeof data[0]?.result !== "number"
    ) {
      throw new Error("Invalid pipeline response format");
    }

    const count = data[0].result as number;
    return {
      success: count <= this.maxLimit,
      limit: this.maxLimit,
      remaining: Math.max(0, this.maxLimit - count),
      resetTime: (currentWindowIndex + 1) * this.windowMs,
    };
  }
}
