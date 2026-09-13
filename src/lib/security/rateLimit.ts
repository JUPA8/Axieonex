import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = { limited: false } | { limited: true; retryAfterSeconds: number };

let limiter: Ratelimit | null | undefined;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    limiter = null;
    return limiter;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "axieonex:formsubmit",
  });
  return limiter;
}

/**
 * Sliding-window rate limit (5 submissions per 10 minutes) keyed by a caller
 * identifier — typically the requester's IP. If Upstash isn't configured
 * (UPSTASH_REDIS_REST_URL/TOKEN unset), this logs once and always allows the
 * request through rather than blocking every submission for lack of a
 * provider.
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const client = getLimiter();
  if (!client) {
    return { limited: false };
  }

  const { success, reset } = await client.limit(key);
  if (success) return { limited: false };
  return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}

let warnedOnce = false;

/** Logs a single one-time warning when rate limiting is running unconfigured. */
export function warnIfRateLimitUnconfigured() {
  if (warnedOnce) return;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    warnedOnce = true;
    console.warn("[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN not set — public forms are not rate-limited.");
  }
}
