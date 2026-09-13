"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Catches errors thrown while rendering the root layout itself, which
 * error.tsx boundaries elsewhere in the tree can't. Must render its own
 * <html>/<body> since it replaces the root layout when it triggers.
 * Sentry.captureException is a safe no-op if ERROR_MONITORING_DSN was unset
 * and Sentry.init() never ran.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#0a0a0f",
          color: "#f5f5f7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.75rem", fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong.</h1>
          <p style={{ maxWidth: "48ch", color: "#a1a1aa" }}>
            An unexpected error occurred while loading this page. You can try again, or return to the homepage.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              minHeight: "44px",
              padding: "0.75rem 1.25rem",
              borderRadius: "4px",
              border: "1px solid #3f3f46",
              background: "transparent",
              color: "#f5f5f7",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {/* Plain <a>: this replaces the root layout on a crash, so next/link's router context may itself be broken. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              padding: "0.75rem 1.25rem",
              borderRadius: "4px",
              background: "#f5f5f7",
              color: "#0a0a0f",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Return home
          </a>
        </div>
      </body>
    </html>
  );
}
