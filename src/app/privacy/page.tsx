import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS, PRIVACY_WARNING } from "@/content/privacy";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/privacy`;

export const metadata: Metadata = {
  title: "Privacy Policy | AXIEONEX",
  description: "How AXIEONEX collects, uses, and protects personal data.",
  alternates: { canonical: CANONICAL },
};

export default function PrivacyPage() {
  return <LegalPageLayout title="Privacy Policy" lastUpdated={PRIVACY_LAST_UPDATED} warning={PRIVACY_WARNING} sections={PRIVACY_SECTIONS} />;
}
