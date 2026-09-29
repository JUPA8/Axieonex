import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { TERMS_LAST_UPDATED, TERMS_SECTIONS, TERMS_WARNING } from "@/content/terms";
import { SITE_URL } from "@/lib/site";
import { buildPublicMetadata } from "@/lib/metadata";

const CANONICAL = `${SITE_URL}/terms`;

export const metadata = buildPublicMetadata({
  title: "Terms of Service | AXIEONEX",
  description: "The terms governing use of the AXIEONEX website and services.",
  canonical: CANONICAL,
});

export default function TermsPage() {
  return <LegalPageLayout title="Terms of Service" lastUpdated={TERMS_LAST_UPDATED} warning={TERMS_WARNING} sections={TERMS_SECTIONS} />;
}
