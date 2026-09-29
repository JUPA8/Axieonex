import { isIP } from "node:net";
import { headers } from "next/headers";

const HEADER_NAME_PATTERN = /^[a-z0-9-]{1,64}$/;

/** Reads only the single header explicitly configured as normalized by the
 * deployment proxy. Raw forwarding headers are ignored by default. */
export async function getClientIp(requestHeaders?: Pick<Headers, "get">): Promise<string> {
  const trustedHeader = process.env.TRUSTED_PROXY_IP_HEADER?.trim().toLowerCase();
  if (!trustedHeader || !HEADER_NAME_PATTERN.test(trustedHeader)) return "unknown";
  try {
    const headerList = requestHeaders ?? (await headers());
    const value = headerList.get(trustedHeader)?.trim();
    if (!value || value.includes(",") || isIP(value) === 0) return "unknown";
    return value;
  } catch {
    return "unknown";
  }
}
