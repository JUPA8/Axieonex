import type { Instrumentation } from "next";

/**
 * Next.js instrumentation hook (https://nextjs.org/docs/app/guides/instrumentation).
 * Sentry error monitoring (Backend Phase 3), gated on ERROR_MONITORING_DSN:
 * unset means Sentry.init() is never called, so there is zero runtime
 * overhead and no attempt to report anywhere.
 */
export async function register() {
  if (!process.env.ERROR_MONITORING_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (!process.env.ERROR_MONITORING_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
