import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Prisma's generated client relies on native query-engine binaries that
  // Next.js's server bundler shouldn't try to trace/inline.
  serverExternalPackages: ["@prisma/client"],
  // Inlines the server-side ERROR_MONITORING_DSN into the client bundle too,
  // so src/instrumentation-client.ts can gate on the same single env var
  // instead of requiring a separate NEXT_PUBLIC_-prefixed duplicate.
  env: {
    ERROR_MONITORING_DSN: process.env.ERROR_MONITORING_DSN,
  },
};

// withSentryConfig no-ops the build-time plugin (source map upload, etc.)
// when there's no auth token/org/project configured, which matches this
// project's stance of never requiring credentials that haven't been supplied.
export default withSentryConfig(nextConfig, {
  silent: true,
});
