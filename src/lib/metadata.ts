import type { Metadata } from "next";

/**
 * The shared link-preview card, served by the src/app/opengraph-image.png and
 * twitter-image.png file conventions.
 *
 * It has to be named here rather than left to those conventions alone: an
 * image file attaches to the segment it sits in, and every route below the
 * root exports its own `openGraph` object, which replaces the inherited one
 * image and all. Declaring it in the one helper each route already calls is
 * what keeps every page's preview identical.
 */
const PREVIEW_IMAGE = {
  width: 1200,
  height: 630,
  type: "image/png",
  alt: 'The AXIEONEX symbol beside the AXIEONEX wordmark and the line "AI-Orchestrated, Human-Executed Revenue Systems" on a black field.',
} as const;

const OG_IMAGE = { url: "/opengraph-image.png", ...PREVIEW_IMAGE };
const TWITTER_IMAGE = { url: "/twitter-image.png", ...PREVIEW_IMAGE };

export function buildPublicMetadata({
  title,
  description,
  canonical,
  type = "website",
}: {
  title: string;
  description: string;
  canonical: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type, images: [OG_IMAGE] },
    // The card is 1200x630, so it only renders at full width behind
    // summary_large_image; "summary" would crop it to a square thumbnail.
    twitter: { card: "summary_large_image", title, description, images: [TWITTER_IMAGE] },
  };
}
