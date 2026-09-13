import * as Sentry from "@sentry/nextjs";

/**
 * Only imported by src/instrumentation.ts when ERROR_MONITORING_DSN is set
 * (NEXT_RUNTIME === "edge"), so this file never runs, and Sentry never
 * initializes, unless that env var is present.
 */
Sentry.init({
  dsn: process.env.ERROR_MONITORING_DSN,
  tracesSampleRate: 0.1,
});
