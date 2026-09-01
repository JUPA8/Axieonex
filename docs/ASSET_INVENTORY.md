# Asset Inventory — axieonex.com

Generated from a live crawl of all 21 sitemap routes (Playwright/Chromium, 2026-09-01), reading every `<img>` element's resolved `src`/`currentSrc` and every element's computed `background-image`. This is the **complete set of visual assets** found across the entire public site — the footprint is very small.

## Images

| Asset | Original source URL | Alt text | Natural size | Used on | Ownership |
|---|---|---|---|---|---|
| AXIEONEX logo | `https://horizons-cdn.hostinger.com/c23b2df4-1dbe-42ef-8971-1503a54dad1a/9fca6984c2f08b0792bebd8624757a27.png` | "AXIEONEX Logo" | 399×154 | Header + footer on every one of the 21 routes | Axieonex-owned brand asset — safe to download and reuse. |
| "Neural Network Background" | `https://images.unsplash.com/photo-1679978880855-fb35585ce343` | "Neural Network Background" | 2000×2500 | Decorative background in the final CTA section on 9 routes (home, about-axon, how-we-work, pricing, and the 6 blog-style article pages) | **Third-party stock photo (Unsplash), not an Axieonex asset.** Per your rule 12 ("reuse public assets only where they belong to Axieonex"), this should **not** be copied into the new project as a first-party asset. See "Required decision" below. |

No CSS `background-image` values were found on any route — every visual element observed is either the two images above, solid colors/gradients, or SVG icons rendered inline by the JS bundle (icon library, not separately downloadable image files — see "Icons" below).

## Favicon

`https://axieonex.com/vite.svg` — this is Vite's **default placeholder favicon**, not a real Axieonex mark. Confirmed by fetching it: it is the stock Vite lightning-bolt SVG. This is a live branding gap on the production site, not a reconstruction artifact — flagged in the audit doc.

## Fonts

Loaded via Google Fonts (`@import`/`<link>`, confirmed as the only font-related network requests on every route):

- **Family:** Space Grotesk
- **Weights:** 300, 400, 500, 600, 700
- **Stylesheet URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`
- **Font file example served from that stylesheet:** `https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2`

Space Grotesk is an open-source (OFL-licensed) Google Font — safe to self-host or keep loading from Google Fonts in the rebuild; either is legitimate, self-hosting is better for performance/privacy (no third-party request).

## Icons

The UI uses inline SVG icons (checkmarks, chevrons, hamburger menu, social/contact glyphs) rendered directly by the JS bundle rather than as separate image files — no individual icon image requests were observed on any route. These will need to be **recreated** with a standard icon set (e.g., Lucide/Heroicons) during reconstruction rather than "downloaded," since the originals are inline vector markup inside a minified bundle, not standalone assets. Per your rule 4, the minified bundle itself must not be copied — only the visual result should be reproduced with clean, licensed icon components.

## Video

None found. `robots.txt`/sitemap and all 21 crawled pages show no `<video>` elements or video asset requests.

## Scripts and stylesheets (explicitly excluded from reuse per your rule 4)

Observed on every route load:
- `https://www.axieonex.com/assets/index-9ca6098a.js` — minified Vite/React application bundle. **Not to be copied into the rebuild.**
- `https://www.axieonex.com/assets/index-ac5bd746.css` — compiled Tailwind/CSS output. **Not to be copied into the rebuild.**

These confirm the live site is a Vite-built single-page app (see `CURRENT_SITE_AUDIT.md` for the full technology assessment).

## Required decision before Phase 1 downloads any image

The only non-brand image on the site (the Unsplash "Neural Network Background" photo) is not an Axieonex-owned asset. Options, per your own rule 12:

1. **Do not reuse it.** Replace it in the rebuild with a placeholder/comment noting a real asset is needed, or a similar openly-licensed image you choose.
2. **License it properly.** If you have (or obtain) a valid Unsplash license/attribution for this specific photo, it can be self-hosted with the source URL recorded here as provenance.

I have not downloaded this image and will not until you tell me which option to take.

The AXIEONEX logo PNG will be downloaded into `public/brand/` in Phase 1 (it's the one asset clearly owned by Axieonex), with this file kept as its provenance record.
