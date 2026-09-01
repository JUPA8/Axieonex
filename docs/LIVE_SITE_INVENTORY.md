# Live Site Inventory — axieonex.com

**Date of inspection:** 2026-09-01
**Method:** `robots.txt` + `sitemap.xml` fetch, manual browser inspection (navigation, forms, mobile menu, FAQ accordion, demo-request modal), and an automated Playwright/Chromium crawl of all 21 sitemap routes capturing HTML, console output, network requests, and full-page screenshots at 3 breakpoints. No forms were submitted; no destructive or authenticated actions were taken.

## 1. What the site is

Axieonex is a B2B sales/lead-generation agency marketing site: "AI-orchestrated, human-executed" outbound sales as a managed service (lead gen, appointment setting, cold email/calling, LinkedIn outreach, hybrid SDR, pre-sales/GTM strategy). It's a marketing + light content (blog-style "articles") site with a demo-request lead form — **not** an application with user accounts, logins, or a visible product UI.

## 2. Technology (publicly observable)

- **Generator tag:** `<meta name="generator" content="Hostinger Horizons" />` — built with Hostinger's "Horizons" AI site builder.
- **Runtime:** Client-side-rendered single-page app. The raw HTML document served for every URL (including nonexistent ones) is an essentially empty shell: `<title>Hostinger Horizons</title>`, no meta description, one `<script type="module" src="/assets/index-9ca6098a.js">` and one `<link rel="stylesheet" href="/assets/index-ac5bd746.css">`. All content, routing, titles, and meta tags are generated client-side after that JS bundle executes.
- **Bundler:** Vite (asset filenames follow Vite's `index-[hash].js`/`.css` convention; the favicon is literally Vite's unmodified default `vite.svg`).
- **Framework:** Behavior (client-side routing across 21 distinct paths without full page reloads, component-driven accordions/modals) is consistent with React, though this can't be confirmed with certainty from a minified bundle without deeper reverse-engineering, which is out of scope per your instructions.
- **Styling:** Utility-class patterns visible in rendered markup are consistent with Tailwind CSS, compiled to a single CSS bundle.
- **Hosting:** Server returns HTTP 200 for every path tested, including a deliberately invented nonexistent path — confirming an SPA catch-all rewrite (all paths resolve to the same `index.html` shell) rather than real server-side routing.
- **No backend API calls were observed** on any of the 21 routes during normal browsing (page loads, FAQ accordion, mobile menu, opening the demo-request modal). The only network requests on any page are: the app's own JS/CSS, Google Fonts, the logo image, and (on 9 routes) one Unsplash stock photo. Submitting the demo-request form was **not tested** (per your instruction not to submit forms), so whether/where that form actually posts data is unconfirmed — see `BACKEND_REQUIREMENTS.md` questions.
- **No analytics or tracking scripts, no cookie-consent third-party SDK, no chat widget, no A/B testing script** were observed loading on any route, despite the site displaying its own cookie-consent banner ("Accept All" / "Reject All" / "Manage Preferences") — the banner itself appears to be a custom in-bundle component, not a third-party consent-management platform, and nothing observably changes on the network side when interacting with it.

## 3. Routes discovered

All 21 real routes came directly from `sitemap.xml` (`https://axieonex.com/sitemap.xml`), and were cross-checked against every internal link found while crawling all 21 pages — no additional routes were discovered beyond the sitemap. Full per-route detail is in `ROUTE_INVENTORY.md`.

| Category | Routes |
|---|---|
| Home | `/` |
| Commercial | `/pricing` |
| Content hub | `/articles` |
| Content pages (blog-style) | `/about-axon`, `/how-we-work`, `/ai-human-hybrid-model`, `/ai-vs-traditional-teams`, `/why-hiring-sdrs-broken`, `/cold-outreach-to-revenue`, `/ai-sales-tools-fail`, `/cost-inhouse-vs-outsourced` |
| Service pages | `/services/lead-generation`, `/services/appointment-setting`, `/services/hybrid-sdr`, `/services/cold-email`, `/services/linkedin-outreach`, `/services/cold-calling`, `/services/presales-gtm` |
| Legal | `/privacy-policy`, `/terms-of-service`, `/cookies-policy` |

**Two of the content pages are orphaned:** `/ai-human-hybrid-model` and `/cost-inhouse-vs-outsourced` have real, unique content and are indexed in `sitemap.xml`, but are **not linked from anywhere in the live site's own navigation, homepage, footer, or `/articles` listing** — see `CURRENT_SITE_AUDIT.md` §5 for the full mislinking analysis (this connects to a broader bug: the homepage's 6 "Learn More" article cards mostly link to the wrong destination page).

A deliberately-invented nonexistent path (`/this-page-does-not-exist-404-check`) was also tested to check 404 handling — see the audit doc; there is no custom 404 page, the app just renders header+footer with an empty content area and HTTP 200.

## 4. Header (present identically on all 21 routes)

- Logo (links to `/`)
- Nav: **About Axieonex** (`/about-axon`), **Services** (dropdown/expand, not a direct link — reveals the 7 service links), **Blogs** (`/articles`), **Pricing** (`/pricing`)
- **Book a Strategy Call** button — opens the demo-request modal (see below)
- Hamburger menu on narrow viewports, expanding to a full-screen overlay with the same links plus the 7 service links inline

## 5. Footer (present identically on all 21 routes)

- Logo + one-sentence company description
- Nav list: About Axieonex, How We Work, Blogs, Pricing
- "Our Services" list: all 7 service links
- "Contact & Legal": `info@axieonexsales.net` (mailto link — note the domain is `axieonexsales.net`, different from the `axieonex.com` site domain), "Operating Globally - Serving clients across North America, Europe, and selected international markets", Privacy Policy / Cookies Policy / Terms of Service links
- Copyright: "© 2026 Axieonex Sales. All rights reserved." + tagline "AI-powered sales systems built for modern B2B companies."

## 6. The demo-request form ("Get a Free Demo" / "Book a Strategy Call")

Both CTAs across the site open the same modal, titled "Book Your Free Strategy Call." Full field list (captured live, not submitted):

| Field | Type | Required |
|---|---|---|
| Full Name | text | yes |
| Company Name | text | yes |
| Your Role / Position | select (Founder/Co-Founder, CEO, Head of Sales, VP Sales, Marketing Leader, Revenue/Growth Lead, Operations, Other) | yes |
| Company Website | text | yes |
| Business Email | email | yes |
| Phone Number | tel | yes |
| Company Size | select (1–10, 10–50, 50–100, 100+ employees) | yes |
| Country | select (49 countries + "Other Countries") | yes |
| Monthly Budget | select ($3k–$5k, $5k–$9k, Not sure yet) | yes |
| What are you hoping to improve? | textarea, 150-char limit | optional |

Submit button: "Request My Free Strategy Call." No network request was observed simply from **opening** the modal (it's rendered entirely client-side); what happens on **submit** was not tested per your instructions and needs your explicit approval before it's tested, if you want that confirmed at all.

## 7. Cookie consent banner

Appears on load: "We value your privacy… Read our Cookie Policy" with **Manage Preferences / Reject All / Accept All** buttons. Appears to be a custom, first-party component (no third-party consent-management network calls observed) rather than a real CMP integration — worth confirming with you whether any consent choice actually gates anything, since no tracking scripts were observed running either way.

## 8. Responsive behavior

Tested at 390×844 (mobile), 768×1024 (tablet), 1440×1000 (desktop) on every route (see `reference-screenshots/`). The header collapses to a hamburger menu below roughly 768–820px; layouts reflow from multi-column grids to single-column stacks; no horizontal scroll or obviously broken layout was observed at any of the 3 breakpoints on any route.

## 9. What could NOT be recovered from browser inspection

Per your stated limitation, the following are genuinely inaccessible from public inspection and are **not** guessed at anywhere in this audit or in the rebuild:
- The original uncompiled React/Vite source (component structure, prop names, file layout) — only the compiled, minified bundle is public, and per your rule 4 it is not being copied in.
- Any backend/API behavior behind the demo-request form (where it posts, what validates it, what "success" looks like) — untested by instruction, and even if tested, only the client-observable request/response would be visible, not server logic.
- Database schema, CRM integration, or how leads are actually processed after submission.
- Hostinger Horizons project configuration/internal files.
- Real Unsplash license status for the one third-party stock photo in use (see `ASSET_INVENTORY.md`).

See `docs/BACKEND_REQUIREMENTS.md` (to be created in Phase 1) for exactly what would need to be provided if real backend integration is ever wanted.
