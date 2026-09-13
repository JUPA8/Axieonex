"use client";

import { useEffect, useId } from "react";
import Script from "next/script";

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

/**
 * Cloudflare Turnstile widget. Renders nothing if no site key was supplied
 * (CAPTCHA_SITE_KEY unset), the form still submits, just without this layer
 * of spam protection, rather than blocking every submission on a provider
 * that hasn't been set up yet.
 *
 * When used inside a plain <form>, Turnstile auto-injects a hidden
 * `cf-turnstile-response` input the server action can read straight off
 * FormData, no `onVerify` needed. When the caller isn't a native form
 * submission (the booking wizard drives its own React state), pass
 * `onVerify` and Turnstile calls it with the token via a window-scoped
 * callback instead.
 */
export function TurnstileWidget({ siteKey, onVerify }: { siteKey?: string; onVerify?: (token: string) => void }) {
  const callbackName = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    if (!onVerify) return;
    window[callbackName] = onVerify;
    return () => {
      delete window[callbackName];
    };
  }, [callbackName, onVerify]);

  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer strategy="lazyOnload" />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="dark"
        data-callback={onVerify ? callbackName : undefined}
      />
    </>
  );
}
