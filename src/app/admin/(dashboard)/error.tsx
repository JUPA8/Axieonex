"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div role="alert" aria-live="assertive" className="mx-auto max-w-2xl rounded-lg border border-ax-border-subtle p-8 text-center">
      <h1 className="text-2xl font-bold">Administration data could not be loaded</h1>
      <p className="mt-3 text-ax-text-muted">
        The protected data is temporarily unavailable. No record details or internal error information have been exposed.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 min-h-11 rounded-sm border border-ax-border-default px-5 py-2.5 font-semibold text-ax-text-primary hover:border-ax-text-primary"
      >
        Try again
      </button>
    </div>
  );
}
