# Current Site Audit — axieonex.com

Findings below are grouped by category. Every item was directly observed (crawl output, manual browser testing, or raw HTTP fetches) — see `LIVE_SITE_INVENTORY.md` and `ROUTE_INVENTORY.md` for the underlying data. Nothing here is speculative.

## 1. Content bug: homepage article cards link to the wrong pages

The homepage's "Learn More About Axieonex" section shows 6 article cards. Comparing each card's **title text** against the **actual page titles** at its link target shows 5 of 6 cards link to the wrong destination — each card's title matches a *different* real page than the one it links to:

| Card # | Card title shown | Links to | Should link to (title match) |
|---|---|---|---|
| 1 | "How We Use an AI + Human Hybrid Model to Build Predictable Revenue" | `/about-axon` | `/ai-human-hybrid-model` |
| 2 | "AI-Powered Sales Systems vs. Traditional Human Teams…" | `/how-we-work` | `/ai-vs-traditional-teams` |
| 3 | "Why Hiring SDRs Is Broken (And What Replaces Them)" | `/why-hiring-sdrs-broken` | ✅ correct |
| 4 | "From Cold Outreach to Revenue Systems…" | `/ai-vs-traditional-teams` | `/cold-outreach-to-revenue` |
| 5 | "Why Most AI Sales Tools Fail Without Human Oversight" | `/cold-outreach-to-revenue` | `/ai-sales-tools-fail` |
| 6 | "The True Cost of In-House Sales Teams vs. Outsourced AI-Driven Systems" | `/ai-sales-tools-fail` | `/cost-inhouse-vs-outsourced` |

A user clicking almost any homepage article card lands on a page whose actual heading doesn't match what they clicked. This same off-by-one-ish pattern is the reason two real, fully-written pages — `/ai-human-hybrid-model` and `/cost-inhouse-vs-outsourced` — are **orphaned**: they exist, have unique content, and are in `sitemap.xml`, but nothing in the live site's own header, footer, homepage, or `/articles` listing links to them.

**Decision needed for Phase 1:** your brief says both "preserve existing behavior" and "do not reproduce obvious bugs" (the latter is scoped to visual polish in the instructions, but this is a functional/content bug, not a visual one). I'd recommend fixing the hrefs to match their titles during reconstruction — it's an unambiguous, low-risk correction, not a redesign — but I'm flagging it rather than silently changing it, per your rule 8. Tell me whether to fix it, or preserve it bug-for-bug for exact parity.

## 2. SEO problems

1. **No canonical tags anywhere.** All 21 routes return `canonical: null`. No self-referencing canonical URLs are set at all.
2. **No structured data (JSON-LD) anywhere.** Zero `<script type="application/ld+json">` blocks on any of the 21 routes — no Organization, Article, FAQPage, BreadcrumbList, or Service schema, despite the site having clear FAQ content (homepage FAQ accordion) and clear Article-shaped content (the 8 blog-style pages) that are prime candidates for it.
3. **No Open Graph or Twitter Card tags anywhere.** `og:title`/`og:description` are absent on all 21 routes — links shared on social/Slack/iMessage will show no preview image, no custom title, no custom description; the platform will fall back to whatever it can scrape from the bare page (likely nothing useful, since the HTML shell has no content pre-render — see item 5).
4. **Title tags are inconsistent in length.** Legal and top-level pages are appropriately short (24–51 chars), but 8 of the blog-style content pages have titles between 66 and **114 characters** (`/ai-vs-traditional-teams` is 114 chars), well past Google's ~55–60 character display truncation.
5. **No pre-rendered content for non-JS crawlers/simple scrapers.** The raw HTML served for every URL (confirmed via direct `curl`, no JS execution) is a near-empty shell — `<title>Hostinger Horizons</title>`, no meta description, no visible content, just script/style tags. Modern search engine crawlers generally execute JS and will see the real per-page content, but any tool, bot, or preview service that doesn't will see nothing useful. This is a structural SPA limitation, not a simple fix — worth being aware of for the rebuild's architecture decision (a framework capable of static/server rendering, like Next.js, resolves this by default).
6. **No custom 404 handling; unknown URLs return HTTP 200.** Every path — including one deliberately made up to test this — returns status 200 and silently renders header+footer with an empty body, no error message, no "page not found," and a title that never updates from the generic "Hostinger Horizons" shell. This is bad for both users (silent failure, no way back except nav) and search engines (soft-404s can get indexed or waste crawl budget).

## 3. Branding

- Live spelling is **consistently "Axieonex"** across the wordmark, all 21 pages' body text, and page titles — no instance of "Axieonix" was found anywhere on the live site. This confirms your instruction to keep "Axieonex" for this rebuild.
- The logo displays as "AXIEONEX" with the tagline "AI-POWERED REVENUE ENGINE" beneath it, stacked with an angular mountain/diamond glyph — consistent across header and footer everywhere.
- **The favicon is Vite's unmodified default SVG** (`/vite.svg`, the stock lightning-bolt icon), not an Axieonex mark — a real, live branding gap, not something to fix invisibly; it should be replaced with a proper favicon derived from the real logo in Phase 1.
- **Footer contact email uses a different domain than the site itself:** `info@axieonexsales.net`, while the site is `axieonex.com`. This may be intentional (a separate outreach/sales domain) or a legacy leftover — worth confirming with you rather than assuming either way; it's being preserved exactly as-is per rule 8 until you say otherwise.
- Copyright line reads "© 2026 Axieonex Sales." (not "Axieonex" alone) — another naming variant (`Axieonex Sales`) used specifically in the legal/copyright context, consistent across all pages' footers. Worth deciding whether the rebuild keeps this exact wording.

## 4. Technical/architecture problems

1. **Fully client-rendered SPA with no static content** (see SEO §5) — every page is a blank shell until ~700ms+ of JS execution completes. This is the root cause of most of the SEO gaps above and is the main architectural argument for moving to a framework with real SSR/SSG in Phase 1, which your brief already specifies (Next.js App Router).
2. **Dev/debug instrumentation shipped to production.** The live HTML `<head>` includes inline scripts wiring `window.onerror`, a `console.error` override, and a Vite error-overlay `MutationObserver`, all of which `postMessage` error details to `window.parent` using the wildcard origin `'*'`. This is Hostinger Horizons' own live-preview/edit tooling, left active on the public production site. It doesn't leak secrets (there are none client-side to leak), but it does mean **any page that iframes axieonex.com would receive a stream of the site's runtime error details via postMessage**, and it's dead weight on every real page load. Not reproducible or relevant in a hand-built Next.js rebuild — it disappears automatically by not being Hostinger Horizons.
3. **No analytics, no tracking, no visible way to measure the site's own marketing performance** — worth flagging as a gap regardless of the rebuild, though adding analytics is a product decision for you, not something to add silently.
4. **Two real content pages are unreachable through normal navigation** (see §1) — a discoverability/content-architecture problem as much as a bug.

## 5. Accessibility (WCAG-oriented, observed only — no automated axe-core scan was run)

- **Heading hierarchy is clean:** every one of the 21 routes has exactly one `<h1>`, and no page is missing one. This is a genuine strength to preserve.
- **FAQ accordion and mobile menu are keyboard/screen-reader accessible as native `<button>` elements** (confirmed via the accessibility tree during manual testing) — better than a hand-rolled prototype might do; worth preserving that pattern in the rebuild.
- **Images:** only 2 unique images exist site-wide, and both have descriptive (if generic) alt text ("AXIEONEX Logo", "Neural Network Background") — no missing alt text found, but "Neural Network Background" is arguably decorative and could reasonably be `alt=""` with `role="presentation"` rather than announced to screen readers; a judgment call for Phase 1, not a defect.
- **Color contrast, focus-visible states, and reduced-motion behavior were not systematically measured** in this pass (would need an automated contrast/axe scan against the actual rendered colors) — flagging as untested rather than claiming a result either way. Recommend running an automated accessibility check (e.g., axe-core or Lighthouse) against the rebuilt local site in the verification phase, per your own QUALITY VERIFICATION requirements.

## 6. Forms

- The single demo-request form (shared by all "Get a Free Demo" / "Book a Strategy Call" CTAs across every page) was fully inspected (all fields, types, options — see `LIVE_SITE_INVENTORY.md` §6) but **not submitted**, per your explicit instruction.
- Opening the form triggers **zero network requests** — it's rendered entirely client-side, so nothing about its actual submission endpoint, validation, or success/failure behavior is observable without submitting it (which requires your separate explicit approval, and even then real backend behavior can't be reconstructed, only documented — see rule 9).
- No visible client-side validation feedback was tested (would require attempting invalid input) — left untested rather than assumed.

## 7. Visual consistency

Full-page screenshots at all 3 breakpoints (mobile 390×844, tablet 768×1024, desktop 1440×1000) for all 21 routes are in `reference-screenshots/`. At a glance across all of them: consistent header/footer, consistent dark theme with a cyan/blue accent (`#` values to be extracted precisely as CSS custom properties during Phase 1 component build, not guessed here), consistent card/section patterns across service pages. No broken layouts, overlapping text, or obvious rendering failures were observed at any of the 3 breakpoints on any route.

## 8. Summary — what this means for Phase 1

**Sufficient public information exists to reconstruct the site safely.** Every route, its full text content, its structure, its navigation, and its one real form are fully documented. The only things Phase 1 cannot do — and won't attempt to fake — are:
- Reproducing the real submission endpoint/backend for the demo-request form (form UI + validation only, per your FORMS section).
- Re-hosting the Unsplash photo without a licensing decision from you (§ in `ASSET_INVENTORY.md`).
- Recovering the original uncompiled source, exact design tokens (spacing scale, exact color hex values, exact type scale) beyond what can be read from rendered/computed styles — Phase 1 will extract these from computed styles during component-building and note where a value is an approximation of the live rendering rather than a confirmed source value.

One content decision needs your input before or during Phase 1: whether to fix the mislinked homepage article cards (§1) or preserve them exactly as broken.
