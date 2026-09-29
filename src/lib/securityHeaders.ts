const sentryOrigin = (() => {
  try {
    return process.env.ERROR_MONITORING_DSN ? new URL(process.env.ERROR_MONITORING_DSN).origin : null;
  } catch {
    return null;
  }
})();

const connectSources = ["'self'", "https://plausible.io", "https://challenges.cloudflare.com", "https://api.calendly.com", sentryOrigin].filter(Boolean);

export function buildContentSecurityPolicy(environment = process.env.NODE_ENV) {
  const developmentEval = environment === "development" ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'unsafe-inline'${developmentEval} https://assets.calendly.com https://challenges.cloudflare.com https://plausible.io`,
    "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSources.join(" ")}`,
    "frame-src https://calendly.com https://*.calendly.com https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const CONTENT_SECURITY_POLICY = buildContentSecurityPolicy("production");

export function buildSecurityHeaders(
  environment = process.env.NODE_ENV,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL,
  deploymentEnvironment = process.env.VERCEL_ENV,
) {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(environment) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    ...(deploymentEnvironment === "preview"
      ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      : []),
    ...(environment === "production" && (siteUrl ?? "").startsWith("https://")
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
  ];
}

export const SECURITY_HEADERS = buildSecurityHeaders();
