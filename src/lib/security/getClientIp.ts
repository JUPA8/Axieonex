import { headers } from "next/headers";

/**
 * Best-effort caller IP for rate-limiting/abuse review, read from the
 * standard proxy headers (Vercel and most reverse proxies set
 * x-forwarded-for; some set x-real-ip instead). Returns "unknown" if
 * neither is present, or if called outside a request scope (e.g. a unit
 * test invoking a Server Action directly) — callers should still work
 * (rate limiting just degrades to grouping all such requests together)
 * rather than throw.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return headerList.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}
