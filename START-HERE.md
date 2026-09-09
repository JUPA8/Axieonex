# START HERE — AXIEONEX Design Handoff

## 1. Open the static prototype

Open `prototype/Axieonex Homepage V2 - Revenue in Motion.dc.html` directly in a browser. It is a fully self-contained folder: `axieonex-tokens.css`, `axTransition.js`, `support.js`, and `LogoMark.dc.html` all sit alongside the pages in `prototype/`, so every relative link (`./axieonex-tokens.css`, `./axTransition.js`, and page-to-page links like `Axieonex About.dc.html`) resolves inside this folder with no external dependency.

## 2. Where the 15 canonical pages live

All in `prototype/`: Homepage V2, About, How We Work, Services, Service Detail, Pricing, Insights, Article, Contact, Book Strategy Call, Privacy Policy, Cookies Policy, Terms of Service, Cookie Preferences, 404.

## 3. Previewing the seven service variants

`prototype/Axieonex Service Detail.dc.html` is one reusable template driven by a `?slug=` query parameter. Open it with any of:

`?slug=lead-generation`, `?slug=appointment-setting`, `?slug=hybrid-sdr`, `?slug=cold-email`, `?slug=linkedin-outreach`, `?slug=cold-calling`, `?slug=presales-gtm`

Full mapping to the clean production routes (`/services/lead-generation`, etc.) is in `docs/Axieonex Service Routes Mapping.md`. The Article page works the same way with its own six slugs.

## 4. Where Claude Code should begin

Read `README-CLAUDE-CODE.md` at the root first. It is the complete implementation handoff: repository targets, source-of-truth table, route/component/theme/motion mapping, migration notes, environment variables, checklists, commit sequence, and definition of done.

## 5. Source of truth

Everything in `prototype/`, `styles/`, `scripts/`, `manifests/`, `motion/`, and `docs/` is canonical. `manifests/Axieonex Implementation Manifest.md` lists every canonical file explicitly.

## 6. Reference-only

Everything in `references/`, including `references/REFERENCE-ONLY.md`, which explains why each item is excluded (superseded design drafts and the raw uploaded images, some of which carry the incorrect "AXIONEX" wordmark that must never be reproduced).

## 7. Static-preview limitations

- The page-transition overlay/mark is a per-page instance in this static prototype; in Next.js it must become a single persistent instance in the root layout (see README section 6 and 18).
- Service Detail and Article pages use a `?slug=` query parameter here; production must use real dynamic route segments.
- Cookie Preferences persists to `localStorage` only; production needs a real consent-management platform.
- Booking availability is a hardcoded mock (next 4 weekdays, 4 fixed slots).
- No article has full approved body copy yet, only the template and titles.

## 8. Production Next.js target routes

Full table in `manifests/axieonex-routes.json` (28 routes). Summary: `/`, `/about`, `/how-we-work`, `/services` (+7 detail routes), `/pricing`, `/insights` (+6 article routes), `/contact`, `/book-strategy-call`, `/privacy`, `/cookies`, `/terms`, `/cookie-preferences`, `app/not-found.tsx`.

## 9. Known mocked integrations

Contact form submission, booking submission and calendar availability, cookie-consent persistence, and no analytics/CRM/email/error-monitoring wiring yet. Full detail in `manifests/axieonex-integrations.json`.

## 10. Owner, technical, and legal confirmations still required

Final SEO copy and social images, article authors/dates/full bodies, any published pricing figures, registered legal entity details for the legal pages, cookie/vendor inventory, and selection of every third-party provider (calendar, email, CRM, analytics, consent platform, spam protection, error monitoring, hosting). Full checklist in `README-CLAUDE-CODE.md` section 19.
