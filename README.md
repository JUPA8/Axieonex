# AXIEONEX — Claude Code Implementation Handoff

This is the complete design package for implementing the AXIEONEX website in the existing production repository. Everything customer-facing has been designed and prototyped; this document tells you how to turn it into the real Next.js application.

**Local repository:** `/Users/abdelrahmanahmed/Desktop/axieonex-rebuild`
**GitHub repository:** `https://github.com/JUPA8/Axieonex`
**Target stack:** Next.js (App Router), TypeScript, React, Tailwind CSS (or an equivalent maintainable token-based styling system)

## 0. Before you touch anything

1. Inspect the existing repository structure, dependencies, and any existing pages/components before writing code.
2. Preserve any unrelated existing work in the repo that this handoff does not mention.
3. Create a new branch for this implementation (for example `feature/axieonex-design-system`). Do not commit directly to the default branch.
4. Read this file fully, then read the manifests in the order listed in Section 2, before writing any code.

## 1. Source-of-truth file table

| Design artifact | Status | Use for |
|---|---|---|
| `Axieonex Homepage V2 - Revenue in Motion.dc.html` | canonical | `/` |
| `Axieonex About.dc.html` | canonical | `/about` |
| `Axieonex How We Work.dc.html` | canonical | `/how-we-work` |
| `Axieonex Services.dc.html` | canonical | `/services` |
| `Axieonex Service Detail.dc.html` (+ `Axieonex Service Routes Mapping.md`) | canonical | all 7 `/services/*` |
| `Axieonex Pricing.dc.html` | canonical | `/pricing` |
| `Axieonex Insights.dc.html` | canonical | `/insights` |
| `Axieonex Article.dc.html` | canonical | all 6 `/insights/[slug]` |
| `Axieonex Contact.dc.html` | canonical | `/contact` |
| `Axieonex Book Strategy Call.dc.html` | canonical | `/book-strategy-call` |
| `Axieonex Privacy Policy.dc.html` | canonical | `/privacy` |
| `Axieonex Cookies Policy.dc.html` | canonical | `/cookies` |
| `Axieonex Terms of Service.dc.html` | canonical | `/terms` |
| `Axieonex Cookie Preferences.dc.html` | canonical | `/cookie-preferences` |
| `Axieonex 404.dc.html` | canonical | `app/not-found.tsx` |
| `LogoMark.dc.html` | canonical | `BrandMark` component |
| `axTransition.js` | canonical | reference for `PageTransitionProvider` logic |
| `axieonex-tokens.css` / `axieonex-tokens.json` | canonical | design tokens |
| `axieonex-shared.css` | canonical | shared foundation classes |
| Everything else in the project (see `Axieonex Implementation Manifest.md`) | reference-only or superseded | do not implement from these |

**Never** reproduce the "AXIONEX" spelling that appears in some uploaded reference images. The correct name is always AXIEONEX.

## 2. Read these manifests, in this order

1. `Axieonex Implementation Manifest.md` (this package's index)
2. `axieonex-routes.json`
3. `axieonex-components.json`
4. `axieonex-tokens.json`
5. `Axieonex Motion Inventory.md` + `axieonex-motion.json`
6. `axieonex-assets.json`
7. `axieonex-content.json`
8. `axieonex-states.json`
9. `axieonex-seo.json`
10. `axieonex-accessibility.json`
11. `axieonex-integrations.json`

## 3. Route mapping

See `axieonex-routes.json` for the full table (28 entries: 20 primary/service/article routes, plus 3 legal, 1 cookie-preferences, 1 booking, 1 contact, 1 not-found). Every route lists its Next.js file target, static source, theme, transition signature, and required components.

## 4. Component tree (summary)

```
app/layout.tsx
  PageTransitionProvider
    SiteHeader (DesktopNavigation | MobileNavigation, BrandMark)
    <page content>
    Footer
```

Full component list, props, variants, and states: `axieonex-components.json`.

## 5. Theme mapping

Each route carries a `theme` value (see route manifest) that maps to a page-specific accent set layered on top of the shared token file: `home-spectral`, `about-pearl`, `engine-graphite` (How We Work), `services-cobalt`, `pricing-graphite`, `insights-editorial`, `contact-converge`, `booking-calibrate`, `legal-restrained`, `not-found-signal`. Implement as a `data-theme` attribute on each route's root element, with theme-specific CSS custom properties scoped under `[data-theme="..."]` in `axieonex-tokens.css`.

## 6. Motion architecture

Implement `PageTransitionProvider` as a client component in the root layout, holding the persistent `BrandMark` and transition overlay so they survive route changes (this is the one thing the static `.dc.html` prototype cannot do — each static page owns its own overlay instance). Reference `axTransition.js` for the destination-signature logic and `axieonex-motion.json` for every other animation's exact trigger/timing/easing/reduced-motion spec.

## 7. Static-to-Next.js migration notes

- Every `.dc.html` page is currently a single file with inline styles for streaming purposes. Decompose each into the component tree described in `axieonex-components.json`; do not port it as one monolithic component.
- Convert inline `style="..."` attributes to Tailwind utility classes or CSS Modules, mapping raw values back to `axieonex-tokens.json` wherever a value matches a token (most colors, spacing, and radii do).
- The Service Detail and Article pages currently use a `?slug=` query parameter in the static preview (documented in `Axieonex Service Routes Mapping.md`). In Next.js, implement these as real dynamic segments: `app/services/[slug]/page.tsx` and `app/insights/[slug]/page.tsx`, with `generateStaticParams` covering the 7 and 6 known slugs respectively.
- `IntersectionObserver`-driven reveal logic (`[data-reveal]`) should become a single reusable client hook/component (see Motion Inventory Section 13), not copy-pasted per page.
- Cookie Preferences' `localStorage` persistence must be replaced with a real consent-management approach before launch (see `axieonex-integrations.json`).

## 8. Required dependencies (suggested, confirm versions against the existing repo)

- `next`, `react`, `react-dom` (already in the repo, presumably)
- `typescript`
- `tailwindcss` (or continue with the repo's existing styling approach if different)
- `framer-motion` (recommended for `PageTransitionProvider`, `BookingWizard` step transitions, and mobile menu)
- No GSAP/WebGL/Canvas dependency is required by anything in this design; do not add heavy animation libraries beyond what's justified above.

## 9. Environment variable template

```
# Contact form delivery
CONTACT_FORM_ENDPOINT=

# Booking / calendar
CALENDAR_PROVIDER_API_KEY=
CALENDAR_ID=

# Email notifications
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=

# CRM
CRM_API_KEY=
CRM_WORKSPACE_ID=

# Analytics (gated behind Cookie Preferences "Analytics" consent)
ANALYTICS_PROVIDER_ID=

# Error monitoring
ERROR_MONITORING_DSN=

# Spam protection (if adopted)
CAPTCHA_SITE_KEY=
CAPTCHA_SECRET=
```

No values are provided. Do not invent credentials. Leave every variable empty until the business owner supplies real values, and fail gracefully (log, don't crash) if a variable is missing at runtime.

## 10. Backend integration checklist

See `axieonex-integrations.json` for the full table. Summary of what must be wired before launch:

- [ ] Contact form submission (currently mocked)
- [ ] Booking submission and calendar availability (currently mocked)
- [ ] Email notifications on contact/booking
- [ ] CRM push
- [ ] Analytics, gated by consent
- [ ] Real consent-management platform (currently `localStorage` only)
- [ ] Spam protection on public forms
- [ ] Error monitoring
- [ ] Hosting/domain/DNS for axieonex.com
- [ ] Article content management approach (hardcoded MDX/JSON vs headless CMS)

## 11. SEO checklist

- [ ] Confirm and finalize every draft title/description in `axieonex-seo.json` with the business owner
- [ ] Produce Open Graph images per route (none exist yet)
- [ ] Implement `generateMetadata` per route using the canonical/title/description values
- [ ] Implement `app/sitemap.ts` including all `index,follow` routes from `axieonex-seo.json`
- [ ] Implement `app/robots.ts`
- [ ] Ensure `app/not-found.tsx` returns a real HTTP 404 status with `noindex, follow`
- [ ] Add Organization schema on `/`, Service schema on service pages, Article schema on article pages once author/date are confirmed

## 12. Accessibility checklist

Full detail in `axieonex-accessibility.json`. Non-negotiable global rules: skip link on every page, single `h1` per page, visible focus states on every interactive element, no color-only state communication, 4.5:1 body contrast, reduced-motion equivalents for every animation, 44px minimum touch targets, and focus moving to the new step/section heading on every wizard/booking step change.

## 13. Responsive checklist

Test every route at: 1920px, 1440px, 1280px, 1024px, 768px, 430px, 390px, and a short-height laptop viewport (approx. 1366x768 with browser chrome). No horizontal overflow, no clipped animation, no navigation overlap, no touch target under 44px. The three-zone nav grid must keep the logo and CTA in their fixed columns regardless of whether the center link row is hidden at the mobile breakpoint (this was a real bug caught and fixed during design; see `Axieonex Motion Inventory.md` Section 11 and the nav.logo-cta-visibility motion entry for the exact fix and why it matters).

## 14. Testing commands (adapt to the repo's actual package.json scripts)

```
npm run lint
npm run typecheck
npm run build
npm run test        # if a test suite exists
```

Additionally, manually verify:
- Every route in `axieonex-routes.json` loads directly (not just via client-side navigation)
- Browser back/forward works on every route
- Keyboard-only navigation reaches every interactive element
- `prefers-reduced-motion: reduce` produces the documented static fallback on every animated element
- Visual comparison of the built pages against their canonical `.dc.html` sources

## 15. Definition of done

- All 28 routes from `axieonex-routes.json` exist and render correctly
- All components from `axieonex-components.json` are implemented as described
- Design tokens from `axieonex-tokens.json` are wired into the styling system, no hardcoded magic values duplicating a token
- Every animation in `axieonex-motion.json` is implemented with its documented reduced-motion alternative
- Lint, typecheck, and build all pass with zero errors
- No console errors on any route
- Accessibility checklist (Section 12) passes
- Responsive checklist (Section 13) passes
- Every mocked integration from `axieonex-integrations.json` is either wired to a real provider or clearly still marked mocked in code comments and in a project tracking issue, never silently presented as complete to end users

## 16. Suggested commit sequence

1. `chore: scaffold design tokens and shared foundations`
2. `feat: implement PageTransitionProvider and BrandMark`
3. `feat: implement SiteHeader, MobileNavigation, Footer`
4. `feat: implement homepage`
5. `feat: implement About, How We Work`
6. `feat: implement Services hub and 7 service-detail routes`
7. `feat: implement Pricing`
8. `feat: implement Insights hub and article template`
9. `feat: implement Contact and Book Strategy Call`
10. `feat: implement legal pages and Cookie Preferences`
11. `feat: implement 404`
12. `chore: SEO metadata, sitemap, robots`
13. `chore: accessibility pass`
14. `test: responsive and interaction QA`

## 17. GitHub push procedure

Only push after: lint, typecheck, and build pass; the manual QA in Section 14 is complete; and no mocked integration is presented to users as functional. Push the feature branch to `https://github.com/JUPA8/Axieonex` and open a pull request for review. Do not merge to the default branch without owner sign-off, and do not push directly to `main`/`master`.

## 18. Known static-preview limitations

- The transition overlay/mark is per-page in the static prototype (each `.dc.html` renders its own instance); in Next.js it must be a single persistent instance in the root layout, per Section 6.
- Service Detail and Article pages use `?slug=` query params in the static preview; production must use real dynamic segments, per Section 7.
- Cookie Preferences persists to `localStorage` only; production needs a real CMP, per Section 10.
- Booking availability is a hardcoded mock (next 4 weekdays, 4 fixed slots); production needs a real calendar query.
- No article has full approved body copy yet; only the template and titles are final.

## 19. Owner, legal, and technical confirmation checklist

- [ ] Final SEO titles/descriptions per `axieonex-seo.json`
- [ ] Open Graph images per route
- [ ] Article authors, publication dates, and full body copy
- [ ] Pricing figures, if the business ever decides to publish them
- [ ] Registered legal entity name, address, and DPO status for Privacy Policy
- [ ] Governing law and jurisdiction for Terms of Service
- [ ] Cookie inventory and vendor list for Cookies Policy and Cookie Preferences
- [ ] Provider selection for: contact-form delivery, calendar, email, CRM, analytics, CMP, spam protection, error monitoring
- [ ] Hosting/domain decision
- [ ] Legal review sign-off on Privacy Policy, Cookies Policy, and Terms of Service before launch

## 20. Mocked functionality (explicit, do not present as production-ready without addressing)

- Contact form submission
- Booking submission and calendar availability
- Cookie consent persistence (localStorage instead of a real CMP)
- No analytics, CRM, email, or error-monitoring integration currently wired

---

This package was produced as a static, inline-styled Design Component prototype (streaming HTML, not a Next.js app) for fast visual iteration and stakeholder review. Its job was to settle every visual, content, interaction, and motion decision so that you can implement the real application without inventing layout, copy, animation, responsive behavior, states, or assets. Follow the manifests; they are the specification.
