const sentryOrigin = (() => {
  try {
    return process.env.ERROR_MONITORING_DSN ? new URL(process.env.ERROR_MONITORING_DSN).origin : null;
  } catch {
    return null;
  }
})();

const connectSources = ["'self'", "https://plausible.io", "https://challenges.cloudflare.com", "https://api.calendly.com", sentryOrigin].filter(Boolean);

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://assets.calendly.com https://challenges.cloudflare.com https://plausible.io",
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  `connect-src ${connectSources.join(" ")}`,
  "frame-src https://calendly.com https://*.calendly.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

export function buildSecurityHeaders(environment = process.env.NODE_ENV, siteUrl = process.env.NEXT_PUBLIC_SITE_URL) {
  return [
    { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    ...(environment === "production" && (siteUrl ?? "").startsWith("https://")
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
  ];
}

export const SECURITY_HEADERS = buildSecurityHeaders();
