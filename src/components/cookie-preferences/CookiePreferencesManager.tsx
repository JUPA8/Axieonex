"use client";

import { useState } from "react";
import {
  ALL_ACCEPTED_CONSENT,
  DEFAULT_CONSENT,
  readConsent,
  writeConsent,
  type ConsentCategory,
  type ConsentState,
} from "@/lib/consent";

function buildCategories(analyticsConfigured: boolean): { key: ConsentCategory; name: string; description: string; locked?: boolean }[] {
  return [
    {
      key: "necessary",
      name: "Strictly Necessary",
      description: "Required for core site function, such as navigation and security. These cannot be switched off and do not require consent.",
      locked: true,
    },
    {
      key: "functional",
      name: "Functional",
      description: "Remembers choices you make, such as these cookie preferences, so you do not need to re-select them on return visits.",
    },
    {
      key: "analytics",
      name: "Analytics",
      description: analyticsConfigured
        ? "Loads Plausible Analytics, a cookie-free, privacy-focused analytics tool, once you consent here. See the Cookies Policy for detail."
        : "Would help us understand how visitors use the site, if and once an analytics tool is implemented. No analytics script is confirmed active; see the Cookies Policy.",
    },
    {
      key: "preferences",
      name: "Preferences",
      description: "Stores settings such as display or regional preferences where applicable to the site.",
    },
    {
      key: "marketing",
      name: "Marketing",
      description: "Would be used only if a marketing or advertising tool is implemented, to measure or personalize communications. No such tool is confirmed active.",
    },
  ];
}

export function CookiePreferencesManager({ analyticsConfigured = false }: { analyticsConfigured?: boolean }) {
  const CATEGORIES = buildCategories(analyticsConfigured);
  const [prefs, setPrefs] = useState<ConsentState>(() => readConsent()?.categories ?? DEFAULT_CONSENT);
  const [savedMessage, setSavedMessage] = useState(false);

  function persist(next: ConsentState) {
    setPrefs(next);
    writeConsent(next);
    setSavedMessage(true);
    window.setTimeout(() => setSavedMessage(false), 4000);
  }

  function toggle(key: ConsentCategory, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {CATEGORIES.map((category) => (
          <div key={category.key} className="rounded-lg border border-ax-border-subtle bg-white/[0.02] p-6">
            <div className="mb-2 flex items-center justify-between gap-6">
              <label htmlFor={`cat-${category.key}`} className="font-semibold text-ax-text-primary">
                {category.name} {category.locked && <span className="ml-2 text-xs font-normal text-ax-text-muted">Always active</span>}
              </label>
              <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
                <input
                  id={`cat-${category.key}`}
                  type="checkbox"
                  role="switch"
                  checked={prefs[category.key]}
                  disabled={category.locked}
                  aria-label={category.locked ? "Strictly necessary cookies, always on" : `${category.name} cookies`}
                  onChange={(e) => toggle(category.key, e.target.checked)}
                  className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full border border-ax-border-default bg-white/10 transition-colors checked:border-ax-violet checked:bg-ax-violet disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ax-text-muted">{category.description}</p>
          </div>
        ))}
      </div>

      <div aria-live="polite" className="mt-6 min-h-6 text-sm text-ax-cyan-alt">
        {savedMessage ? "Your preferences have been saved." : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => persist(DEFAULT_CONSENT)}
          className="min-h-11 rounded-sm border border-ax-border-default px-5 py-3 text-sm text-ax-text-primary hover:border-ax-text-primary"
        >
          Reject optional
        </button>
        <button
          type="button"
          onClick={() => persist(prefs)}
          className="min-h-11 rounded-sm border border-ax-border-default px-5 py-3 text-sm text-ax-text-primary hover:border-ax-text-primary"
        >
          Save preferences
        </button>
        <button
          type="button"
          onClick={() => persist(ALL_ACCEPTED_CONSENT)}
          className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-5 py-3 text-sm font-semibold text-white"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
