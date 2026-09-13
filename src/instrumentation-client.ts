import * as Sentry from "@sentry/nextjs";

/**
 * Next.js auto-loads this file into the client bundle
 * (https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client).
 * ERROR_MONITORING_DSN is inlined here via next.config.ts's `env` map, so the
 * same server-side env var also gates browser-side reporting; unset, this
 * whole block is dead code and Sentry.init() never runs. A Sentry DSN is a
 * public identifier by design (not a secret), so shipping it to the browser
 * is the intended, documented usage.
 */
if (process.env.ERROR_MONITORING_DSN) {
  Sentry.init({
    dsn: process.env.ERROR_MONITORING_DSN,
    tracesSampleRate: 0.1,
  });
}

// Required by the SDK to instrument client-side route transitions; a safe
// no-op call when Sentry.init() above never ran.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
