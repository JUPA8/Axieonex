import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { COOKIES_LAST_UPDATED, COOKIES_SECTIONS, COOKIES_WARNING } from "@/content/cookies";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/cookies`;

export const metadata: Metadata = {
  title: "Cookies Policy — AXIEONEX",
  description: "How AXIEONEX uses cookies and similar technologies.",
  alternates: { canonical: CANONICAL },
};

export default function CookiesPage() {
  return <LegalPageLayout title="Cookies Policy" lastUpdated={COOKIES_LAST_UPDATED} warning={COOKIES_WARNING} sections={COOKIES_SECTIONS} />;
}
