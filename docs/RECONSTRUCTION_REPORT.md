# Reconstruction Report

## 1. Final local project path

`/Users/abdelrahmanahmed/Desktop/axieonex-rebuild`

## 2. Final project tree

```
axieonex-rebuild/
├── .env.example
├── .gitignore
├── README.md
├── next.config.ts
├── package.json
├── tsconfig.json
├── vitest.config.mts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ASSET_INVENTORY.md
│   ├── BACKEND_REQUIREMENTS.md
│   ├── CURRENT_SITE_AUDIT.md
│   ├── LIVE_SITE_INVENTORY.md
│   ├── ROUTE_INVENTORY.md
│   ├── RECONSTRUCTION_REPORT.md          (this file)
│   ├── content-extracted.json             (raw Phase 0→content-layer extraction data)
│   ├── crawl-raw-data.json / crawl-assets.json   (raw Phase 0 crawl output)
│   └── reference-screenshots/             (66 live-site screenshots, 3 breakpoints × 22 routes)
├── public/
│   └── brand/axieonex-logo.png            (the one Axieonex-owned asset reused, per your approval)
├── src/
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css, icon.png, not-found.tsx
│   │   ├── sitemap.ts, robots.ts
│   │   ├── pricing/page.tsx, articles/page.tsx
│   │   ├── [slug]/page.tsx                (8 content pages + 3 legal pages)
│   │   └── services/[slug]/page.tsx       (7 service pages)
│   ├── components/
│   │   ├── layout/   Header, Navigation, MobileMenu, Footer, Logo, CookieConsent
│   │   ├── sections/  Hero, HowItWorks, ArticlesPreview, FaqSection, CtaSection, ServiceBody, LegalBody
│   │   └── ui/        Button, Card, Badge, Container, Heading primitives, Accordion
│   ├── features/
│   │   ├── contact/   DemoModalContext, DemoModal, DemoCtaButton, validation.ts
│   │   └── articles/  ArticleCard, ArticleBody
│   ├── content/        site.ts, services.ts, articles.ts, articlesListing.ts, legal.ts, homepage.ts, pricing.ts
│   ├── types/content.ts
│   └── lib/            cn.ts, formOptions.ts
└── tests/               7 test files, 31 tests
```

## 3. All reconstructed routes (21/21)

Every route from `docs/ROUTE_INVENTORY.md` is live locally: `/`, `/pricing`,
`/articles`, the 8 content pages, the 3 legal pages, and all 7 service
pages. Verified by an automated crawl of the production build — see §6.

## 4. Features that match the live site

- Full header (logo, About/Services-dropdown/Blogs/Pricing, "Book a Strategy
  Call") and footer (nav, 7 services, contact/legal), identical on every route.
- The demo-request modal, all 10 fields, exact options (roles, company
  sizes, 49 countries, budgets), exact copy.
- FAQ accordion (homepage + pricing), same multi-open behavior observed
  live.
- Cookie consent banner (Accept All / Reject All / Manage Preferences).
- Mobile menu with the same link set as desktop.
- All page copy, transcribed verbatim from the Phase 0 crawl (see
  `src/content/*` file headers for provenance notes).
- `robots.txt` and `sitemap.xml`, matching the live site's route list.

## 5. Deliberate differences from the live site (approved / disclosed)

- **Homepage article cards now link correctly.** The live site's cards
  mostly point at the wrong article (5 of 6 — see `docs/CURRENT_SITE_AUDIT.md`
  §1); you approved fixing this. `/articles`' own links were already
  correct and are untouched.
- **The Unsplash "Neural Network Background" photo is not included.** Per
  your approval, that CTA-section background is currently omitted rather
  than reused without a confirmed license (see `docs/ASSET_INVENTORY.md`).
- **A real 404 page exists** (`src/app/not-found.tsx`) where the live site
  silently returns HTTP 200 with an empty body for unknown URLs — required
  by your Phase 1 spec, and a straightforward reliability fix rather than a
  design opinion.
- **Real per-page `<title>`/meta description/canonical tags** are rendered
  server-side for every route — the live site only sets these client-side
  after JS executes (see `docs/CURRENT_SITE_AUDIT.md` §2). Content is
  unchanged; only *when* it's available changed.
- **Favicon** is a real Axieonex mark (cropped from the logo) — the live
  site currently ships Vite's placeholder icon (see `docs/ASSET_INVENTORY.md`).

## 6. Test, lint, type-check, and build results

Commands run exactly as shown, from `/Users/abdelrahmanahmed/Desktop/axieonex-rebuild`:

```
$ pnpm install         → succeeds (354 packages)
$ pnpm lint            → no errors, no warnings
$ pnpm exec tsc --noEmit → no errors (strict mode)
$ pnpm test            → 6 test files, 31 tests, all passing
$ pnpm build           → succeeds; all 21 routes prerendered statically (SSG)
$ pnpm exec next start -p 3100 → production server smoke-tested
```

Additional verification against the running production build (script in
this session's scratchpad, not part of the repo — re-run manually if useful):

- **Broken-link check:** every internal `href` found across all 21 routes
  (21 unique targets) resolves to HTTP 200. None broken.
- **Console error check:** zero console errors/warnings on any of the 21 routes.
- **404 check:** an invented nonexistent path returns HTTP 404 and renders
  the custom not-found page (confirmed via page text).
- **Accessibility (axe-core) scan:** run against all 21 routes.
  Two real issues were found and fixed:
  - `color-contrast`: `--color-fg-subtle` (#6d7f8f) only reached a 4.4:1
    ratio against card backgrounds; raised to #7c8fa0 (5.46:1).
  - `link-in-text-block`: the cookie-banner's "Read our Cookie Policy" link
    relied on color alone; now permanently underlined.
  Re-scanned after both fixes: **zero violations across all 21 routes.**

## 7. Remaining problems / known gaps

- **Spacing density is more compact than the live site**, especially on
  mobile (rebuilt homepage ≈ 6,900px tall at 390px width vs. the live
  site's ≈ 10,300px — reference screenshots in `docs/reference-screenshots/`
  vs. this build). Structure, content, and section order match; the live
  site simply uses more generous padding/line-height throughout. A first
  pass increased section padding and card/accordion spacing, but full
  parity would need more granular, page-by-page tuning. Given your
  instruction not to over-invest in matching an unconfirmed design source
  before Phase 2, this is left as a known gap rather than chased further now.
- **Exact color/spacing tokens are approximations**, read from rendered
  screenshots rather than an original design file (none is publicly
  available — see `docs/ARCHITECTURE.md`).
- **Cookie banner's "Manage Preferences" button** currently just dismisses
  the banner (no preferences panel exists, since there's nothing to
  configure — no tracking scripts run on either the live site or this
  build). This is a judgment call, not a tested match to live behavior,
  since clicking it wasn't tested during Phase 0 to avoid altering site
  state unnecessarily.
- **The demo-request form has no backend** — by design, pending your
  decisions in `docs/BACKEND_REQUIREMENTS.md`.

## 8. Proposed frontend redesign plan (Phase 2 — not started)

Only once you approve: define a confirmed design system — real color
tokens, spacing scale, and typography from brand guidelines if you have
them, rather than values read off screenshots; replace the approximated
dark theme with confirmed values; resolve the Unsplash image decision with
a licensed or original asset; close the spacing-density gap deliberately
rather than by further guessing; add a proper component-level visual
regression setup if the design will keep evolving.

One thing worth flagging explicitly: this session separately worked on a
different, unrelated project this same conversation refers to as
"Axieonix" (note the spelling — a Germany sales-lead-intelligence tool, not
this website). This website's live spelling is unambiguously "Axieonex"
(zero instances of "Axieonix" found anywhere across all 21 routes — see
`docs/CURRENT_SITE_AUDIT.md` §3), which is what this entire rebuild uses
throughout. If these two are meant to be the same company, that spelling
mismatch needs resolving before Phase 2; if they're unrelated, no action
needed.

## 9. Proposed backend implementation plan (Phase 3 — not started)

Only once you approve, and only after the decisions listed in
`docs/BACKEND_REQUIREMENTS.md` are made: a Next.js Route Handler for the
demo-request form with server-side validation and real delivery (email/CRM/
webhook, per your choice), server-only environment variables for any
credentials involved, and — if there's ever a reason to move past a static
marketing site — the auth/database/persistence work outlined generically in
your original brief, scoped down to whatever this specific site actually
needs (a lead-capture form does not obviously need user accounts or a
database of its own).
