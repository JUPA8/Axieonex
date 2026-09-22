import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/security/getClientIp";
import { CONSENT_VERSION, type ConsentState } from "@/lib/consent";
import { parseConsentBody } from "@/lib/serverValidation";

const VISITOR_COOKIE = "axieonex_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, matches typical CMP consent lifetimes.
const MAX_REQUEST_BYTES = 16 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  try {
    const { visitorId, isNew } = await getOrCreateVisitorId();
    const ipAddress = await getClientIp();
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
