import type { Metadata } from "next";
import { CookiePreferencesManager } from "@/components/cookie-preferences/CookiePreferencesManager";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/cookie-preferences`;

export const metadata: Metadata = {
  title: "Cookie Preferences | AXIEONEX",
  description: "Manage your cookie consent preferences.",
  alternates: { canonical: CANONICAL },
  robots: { index: false, follow: true },
};

export default function CookiePreferencesPage() {
  return (
    <div data-theme="legal" className="bg-ax-surface-legal text-ax-text-primary">
      <div className="mx-auto max-w-[760px] px-5 pb-24 pt-28 sm:px-10 sm:pt-36">
        <div className="mb-4 text-[13px] font-semibold text-ax-cyan-alt">Legal</div>
        <h1 className="mb-5 text-[length:var(--ax-fs-h1-fluid)] font-bold tracking-tight">Cookie Preferences</h1>
        <p className="mb-10 max-w-[62ch] text-base leading-relaxed text-ax-text-muted">
          Choose which categories of cookies this site can use. Strictly necessary cookies always remain on because
          the site cannot function without them. You can return to this page at any time to update your choices. See
          our <TransitionLink href="/cookies" className="underline">Cookies Policy</TransitionLink>,{" "}
          <TransitionLink href="/privacy" className="underline">Privacy Policy</TransitionLink> and{" "}
          <TransitionLink href="/terms" className="underline">Terms of Service</TransitionLink> for full detail.
        </p>

        <div role="note" className="mb-10 rounded-md border border-ax-warning/40 bg-ax-warning/10 px-5 py-4 text-sm leading-relaxed text-ax-text-body">
          Your choice is currently saved to this browser only (localStorage), as explicitly disclosed pending a
          production consent-management platform, see axieonex-integrations.json. No optional script (analytics or
          marketing) is loaded by this site regardless of your selection, since none has been integrated yet.
        </div>

        <CookiePreferencesManager />

        <TransitionLink href="/" className="mt-16 inline-block text-sm text-ax-text-muted hover:text-ax-text-primary">
          ← Back to the main website
        </TransitionLink>
      </div>
    </div>
  );
}
