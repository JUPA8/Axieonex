import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { PROVIDER_TIMEOUT_MS, ProviderTimeoutError, withTimeout } from "@/lib/security/providerRequest";

export type RateLimitResult =
  | { status: "allowed" }
  | { status: "limited"; retryAfterSeconds: number }
  | { status: "unavailable"; reason: "not_configured" | "misconfigured" | "timeout" | "provider_error" };

type RateLimitUnavailableReason = Extract<RateLimitResult, { status: "unavailable" }>["reason"];

type RateLimitNamespace = "formsubmit" | "consent";

const limiterConfiguration: Record<RateLimitNamespace, { prefix: string; requests: number }> = {
  formsubmit: { prefix: "axieonex:formsubmit", requests: 5 },
  consent: { prefix: "axieonex:consent", requests: 10 },
};

const limiters: Partial<Record<RateLimitNamespace, Ratelimit | null>> = {};
let configurationError: "not_configured" | "misconfigured" | null = null;

function getLimiter(namespace: RateLimitNamespace): Ratelimit | null {
  if (namespace in limiters) return limiters[namespace] ?? null;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url && !token) {
    configurationError = "not_configured";
    limiters[namespace] = null;
    return null;
  }
  if (!url || !token) {
    configurationError = "misconfigured";
    limiters[namespace] = null;
    return null;
  }

  const config = limiterConfiguration[namespace];
  const limiter = new Ratelimit({
    redis: new Redis({ url, token, signal: () => AbortSignal.timeout(PROVIDER_TIMEOUT_MS) }),
    limiter: Ratelimit.slidingWindow(config.requests, "10 m"),
    prefix: config.prefix,
  });
  limiters[namespace] = limiter;
  return limiter;
}

async function checkNamespacedRateLimit(namespace: RateLimitNamespace, key: string): Promise<RateLimitResult> {
  const client = getLimiter(namespace);
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

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  return checkNamespacedRateLimit("formsubmit", key);
}

export async function checkConsentRateLimit(key: string): Promise<RateLimitResult> {
  return checkNamespacedRateLimit("consent", key);
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
  const vercelEnvironment = process.env.VERCEL_ENV;
  const deployedOnVercel = vercelEnvironment === "preview" || vercelEnvironment === "production";
  return reason !== "not_configured" || process.env.NODE_ENV === "production" || deployedOnVercel;
}
