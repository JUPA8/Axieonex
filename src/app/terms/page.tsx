import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { TERMS_LAST_UPDATED, TERMS_SECTIONS, TERMS_WARNING } from "@/content/terms";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/terms`;

export const metadata: Metadata = {
  title: "Terms of Service | AXIEONEX",
  description: "The terms governing use of the AXIEONEX website and services.",
  alternates: { canonical: CANONICAL },
};

export default function TermsPage() {
  return <LegalPageLayout title="Terms of Service" lastUpdated={TERMS_LAST_UPDATED} warning={TERMS_WARNING} sections={TERMS_SECTIONS} />;
}
