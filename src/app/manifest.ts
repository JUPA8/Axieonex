import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

/**
 * Installable-app metadata for the public site.
 *
 * The icons here are the approved AXIEONEX symbol. `any` covers the browser
 * and home-screen cases that render the artwork untouched; the separate
 * `maskable` entry is inset onto the site's own black field so Android can
 * crop it to a circle or a squircle without cutting into the mark.
 *
 * Next generates the <link rel="manifest"> tag from this route, so no page
 * needs to reference it by hand.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} | AI-Orchestrated, Human-Executed Revenue Systems`,
    short_name: SITE_NAME,
    description:
      "We build revenue pipelines, not just meetings. AI detects signals, humans qualify conversations.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Matches --ax-surface-base so the splash and toolbar hold the site's field.
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
