import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/security/getClientIp";
import { checkConsentRateLimit, shouldFailClosedForAntiAbuse } from "@/lib/security/rateLimit";
import { CONSENT_VERSION, type ConsentState } from "@/lib/consent";
import { parseConsentBody } from "@/lib/serverValidation";

const VISITOR_COOKIE = "axieonex_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, matches typical CMP consent lifetimes.
const MAX_REQUEST_BYTES = 16 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERCEL_DEPLOYMENT_ENVIRONMENTS = new Set(["preview", "production"]);

/**
 * Durable, server-side consent store (Backend Phase 3). The client's
 * localStorage copy (src/lib/consent.ts) is a fast cache; this route and
 * the ConsentRecord table are the source of truth an audit could point to.
 */

async function getOrCreateVisitorId(): Promise<{ visitorId: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing && UUID_PATTERN.test(existing)) return { visitorId: existing, isNew: false };
  return { visitorId: randomUUID(), isNew: true };
}

function toConsentState(record: {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}): ConsentState {
  return {
    necessary: record.necessary,
    functional: record.functional,
    analytics: record.analytics,
    preferences: record.preferences,
    marketing: record.marketing,
  };
}

function singleHeaderValue(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized && !normalized.includes(",") ? normalized : null;
}

function normalizedHost(value: string | null): string | null {
  const host = singleHeaderValue(value);
  if (!host || /[\\/\s]/.test(host)) return null;
  try {
    const parsed = new URL(`http://${host}`);
    return parsed.host.toLowerCase() === host.toLowerCase() && parsed.pathname === "/" ? parsed.host.toLowerCase() : null;
  } catch {
    return null;
  }
}

function isSameOriginRequest(request: Request): boolean {
  const originValue = singleHeaderValue(request.headers.get("origin"));
  const hostHeader = normalizedHost(request.headers.get("host"));
  if (!originValue || !hostHeader) return false;

  let origin: URL;
  let requestUrl: URL;
  try {
    origin = new URL(originValue);
    requestUrl = new URL(request.url);
  } catch {
    return false;
  }
  if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) return false;

  let expectedHost = hostHeader;
  let expectedProtocol = requestUrl.protocol;
  if (VERCEL_DEPLOYMENT_ENVIRONMENTS.has(process.env.VERCEL_ENV ?? "")) {
    expectedHost = normalizedHost(request.headers.get("x-forwarded-host")) ?? "";
    const forwardedProtocol = singleHeaderValue(request.headers.get("x-forwarded-proto"))?.toLowerCase();
    if (!expectedHost || (forwardedProtocol !== "https" && forwardedProtocol !== "http")) return false;
    expectedProtocol = `${forwardedProtocol}:`;
  }

  return origin.protocol === expectedProtocol && origin.host.toLowerCase() === expectedHost;
}

function hasJsonContentType(request: Request): boolean {
  const contentType = request.headers.get("content-type");
  return contentType?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
    if (!visitorId || !UUID_PATTERN.test(visitorId)) return NextResponse.json({ record: null });

    const record = await prisma.consentRecord.findUnique({ where: { visitorId } });
    if (!record || record.version !== CONSENT_VERSION) return NextResponse.json({ record: null });

    return NextResponse.json({ record: { version: record.version, categories: toConsentState(record), updatedAt: record.updatedAt } });
  } catch {
    console.error("[api/consent] GET failed.");
    // Fail closed: the client falls back to treating this as "no server
    // record," never to assuming consent was granted.
    return NextResponse.json({ record: null }, { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: "Unsupported request." }, { status: 415 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  let categories: ConsentState;
  try {
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_REQUEST_BYTES) return NextResponse.json({ error: "Invalid request body." }, { status: 413 });
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) return NextResponse.json({ error: "Invalid request body." }, { status: 413 });
    const parsed = parseConsentBody(JSON.parse(rawBody));
    if (!parsed) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    categories = parsed;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const ipAddress = await getClientIp(request.headers);
  const rateLimit = await checkConsentRateLimit(ipAddress);
  if (rateLimit.status === "limited") {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  if (rateLimit.status === "unavailable" && shouldFailClosedForAntiAbuse(rateLimit.reason)) {
    return NextResponse.json({ error: "Temporarily unavailable." }, { status: 503 });
  }

  try {
    const { visitorId, isNew } = await getOrCreateVisitorId();
    const record = await prisma.consentRecord.upsert({
      where: { visitorId },
      update: { ...categories, version: CONSENT_VERSION, ipAddress },
      create: { visitorId, ...categories, version: CONSENT_VERSION, ipAddress },
    });

    const response = NextResponse.json({ record: { version: record.version, categories: toConsentState(record), updatedAt: record.updatedAt } });
    if (isNew) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VISITOR_COOKIE_MAX_AGE,
        path: "/",
      });
    }
    return response;
  } catch {
    console.error("[api/consent] POST failed.");
    // The client already applied the choice optimistically to localStorage
    // and to any consent-gated scripts on this page load; a failure here
    // just means the server-side audit copy wasn't recorded this time.
    return NextResponse.json({ error: "Failed to persist consent." }, { status: 503 });
  }
}
