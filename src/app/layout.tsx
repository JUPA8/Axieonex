import type { Metadata } from "next";
import { Bricolage_Grotesque, Work_Sans, Space_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { RevealController } from "@/components/motion/RevealController";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
});

// Every route sets its own complete title (per axieonex-seo.json, titles already
// include the AXIEONEX brand name) via generateMetadata/metadata exports, so this
// is only a fallback for a route that defines none, not a template to compose with.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | AI-Orchestrated, Human-Executed Revenue Systems`,
  description: "We build revenue pipelines, not just meetings. AI detects signals, humans qualify conversations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${workSans.variable} ${spaceMono.variable} ${sourceSerif.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="ax-skip-link">
          Skip to content
        </a>
        <PageTransitionProvider>
          <RevealController />
          <SiteHeader />
          <main id="main-content" className="flex-1 pt-[88px]">
            {children}
          </main>
          <Footer />
          <CookieConsentBanner />
        </PageTransitionProvider>
      </body>
    </html>
  );
}
