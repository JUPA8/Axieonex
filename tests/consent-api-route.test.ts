import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  cookieGet: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  getClientIp: vi.fn(),
  consentRateLimit: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/prisma", () => ({
  prisma: { consentRecord: { findUnique: mocks.findUnique, upsert: mocks.upsert } },
}));
vi.mock("@/lib/security/getClientIp", () => ({ getClientIp: mocks.getClientIp }));
vi.mock("@/lib/security/rateLimit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/security/rateLimit")>()),
  checkConsentRateLimit: mocks.consentRateLimit,
}));

import { GET, POST } from "@/app/api/consent/route";

const VISITOR_ID = "123e4567-e89b-42d3-a456-426614174000";
const CATEGORIES = {
  necessary: true,
  functional: false,
  analytics: true,
  preferences: false,
  marketing: false,
};

function consentRequest({
  body = JSON.stringify({ categories: CATEGORIES }),
  origin = "http://localhost:3000",
  contentType = "application/json",
  forwarded = false,
}: {
  body?: string;
  origin?: string | null;
  contentType?: string | null;
  forwarded?: boolean;
} = {}) {
  const requestHeaders = new Headers({ host: "localhost:3000" });
  if (origin !== null) requestHeaders.set("origin", origin);
  if (contentType !== null) requestHeaders.set("content-type", contentType);
  if (forwarded) {
    requestHeaders.set("x-forwarded-host", "preview.axieonex.test");
    requestHeaders.set("x-forwarded-proto", "https");
    if (origin === "http://localhost:3000") requestHeaders.set("origin", "https://preview.axieonex.test");
  }
  return new Request("http://localhost:3000/api/consent", { method: "POST", headers: requestHeaders, body });
}

describe("/api/consent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.cookieGet.mockReturnValue({ value: VISITOR_ID });
    mocks.getClientIp.mockResolvedValue("203.0.113.10");
    mocks.consentRateLimit.mockResolvedValue({ status: "allowed" });
    mocks.findUnique.mockResolvedValue(null);
    mocks.upsert.mockResolvedValue({ version: 1, ...CATEGORIES, updatedAt: new Date("2026-09-29T08:00:00.000Z") });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns no record when the visitor has no consent cookie", async () => {
    mocks.cookieGet.mockReturnValue(undefined);
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ record: null });
  });

  it("accepts a valid same-origin JSON request", async () => {
    const response = await POST(consentRequest());
    expect(response.status).toBe(200);
    expect(mocks.getClientIp).toHaveBeenCalledWith(expect.any(Headers));
    expect(mocks.consentRateLimit).toHaveBeenCalledWith("203.0.113.10");
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { visitorId: VISITOR_ID },
      update: expect.objectContaining(CATEGORIES),
    }));
  });

  it.each([null, "text/plain", "application/xml", "malformed"])(
    "rejects a missing or unsupported content type (%s)",
    async (contentType) => {
      const response = await POST(consentRequest({ contentType }));
      expect(response.status).toBe(415);
      expect(mocks.cookies).not.toHaveBeenCalled();
      expect(mocks.upsert).not.toHaveBeenCalled();
    },
  );

  it("rejects cross-origin and missing-origin requests", async () => {
    const crossOrigin = await POST(consentRequest({ origin: "https://attacker.example" }));
    const missingOrigin = await POST(consentRequest({ origin: null }));
    expect(crossOrigin.status).toBe(403);
    expect(missingOrigin.status).toBe(403);
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("uses Vercel-forwarded host and protocol only in deployed Vercel environments", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = await POST(consentRequest({ forwarded: true }));
    expect(response.status).toBe(200);

    vi.stubEnv("VERCEL_ENV", "");
    const spoofed = await POST(consentRequest({ origin: "https://preview.axieonex.test", forwarded: true }));
    expect(spoofed.status).toBe(403);
  });

  it("rejects malformed and oversized bodies before visitor or database access", async () => {
    const malformed = await POST(consentRequest({ body: "not json" }));
    expect(malformed.status).toBe(400);
    const unexpected = await POST(consentRequest({ body: JSON.stringify({ categories: CATEGORIES, admin: true }) }));
    expect(unexpected.status).toBe(400);
    const oversized = await POST(consentRequest({ body: "x".repeat(16 * 1024 + 1) }));
    expect(oversized.status).toBe(413);
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("rejects a rate-limited request before visitor-ID generation or database access", async () => {
    mocks.consentRateLimit.mockResolvedValue({ status: "limited", retryAfterSeconds: 60 });
    const response = await POST(consentRequest());
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "Too many requests." });
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it.each(["preview", "production"])("fails closed when rate limiting is missing in Vercel %s", async (environment) => {
    vi.stubEnv("VERCEL_ENV", environment);
    mocks.consentRateLimit.mockResolvedValue({ status: "unavailable", reason: "not_configured" });
    const response = await POST(consentRequest({ forwarded: true }));
    expect(response.status).toBe(503);
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it.each(["misconfigured", "timeout", "provider_error"])("fails closed for a %s limiter", async (reason) => {
    mocks.consentRateLimit.mockResolvedValue({ status: "unavailable", reason });
    const response = await POST(consentRequest());
    expect(response.status).toBe(503);
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
