import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { PROVIDER_TIMEOUT_MS, ProviderTimeoutError, withTimeout } from "@/lib/security/providerRequest";

export type RateLimitResult =
  | { status: "allowed" }
  | { status: "limited"; retryAfterSeconds: number }
  | { status: "unavailable"; reason: "not_configured" | "misconfigured" | "timeout" | "provider_error" };

type RateLimitUnavailableReason = Extract<RateLimitResult, { status: "unavailable" }>["reason"];

let limiter: Ratelimit | null | undefined;
let configurationError: "not_configured" | "misconfigured" | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url && !token) {
    configurationError = "not_configured";
    limiter = null;
    return null;
  }
  if (!url || !token) {
    configurationError = "misconfigured";
    limiter = null;
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token, signal: () => AbortSignal.timeout(PROVIDER_TIMEOUT_MS) }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "axieonex:formsubmit",
  });
  return limiter;
}

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const client = getLimiter();
  if (!client) return { status: "unavailable", reason: configurationError ?? "not_configured" };
  try {
    const result = await withTimeout(client.limit(key));
    if (typeof result.success !== "boolean" || typeof result.reset !== "number") {
      console.error("[rateLimit] Upstash returned an invalid response.");
      return { status: "unavailable", reason: "provider_error" };
    }
    const { success, reset } = result;
    if (success) return { status: "allowed" };
    return { status: "limited", retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
  } catch (error) {
    const reason = error instanceof ProviderTimeoutError || (error instanceof Error && error.name === "TimeoutError") ? "timeout" : "provider_error";
    console.error(`[rateLimit] Upstash request failed (${reason}).`);
    return { status: "unavailable", reason };
  }
}

let warnedOnce = false;

export function warnIfRateLimitUnconfigured() {
  if (warnedOnce) return;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    warnedOnce = true;
    console.warn("[rateLimit] Upstash rate limiting is unavailable; production requests fail closed.");
  }
}

export function shouldFailClosedForAntiAbuse(reason: RateLimitUnavailableReason = "not_configured"): boolean {
  return reason !== "not_configured" || process.env.NODE_ENV === "production";
}
