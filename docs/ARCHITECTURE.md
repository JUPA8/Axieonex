# Architecture

## Stack decisions

### Next.js App Router + TypeScript (strict) + Tailwind CSS 4

Required by your Phase 1 brief. Justification beyond "you asked for it":
the live site is a client-rendered SPA with no server-rendered content or
meta tags (see `docs/CURRENT_SITE_AUDIT.md` §2) — every page is blank until
JS finishes executing, there's no canonical/OG/structured data anywhere, and
unknown URLs silently 200 with an empty body. A framework with real
SSG/SSR (Next.js) fixes all of that by construction: each route gets real
`<title>`/`<meta>` at request time, a real 404, a real sitemap. This isn't
"redesigning" the site — it's fixing a structural SEO/reliability gap
inherent to how the live site is currently built, using the tool you already
specified.

### Package manager: pnpm

Both `npm` (10.9.2) and `pnpm` (10.0.0) were already installed on this
machine; `yarn` was not. `pnpm` was chosen over `npm` for faster installs and
stricter dependency resolution (no phantom access to undeclared
dependencies) — a reasonable default for a project expected to grow across
Phase 2/3. Either works; this wasn't a hard constraint from your brief.

### Vitest + React Testing Library (not Jest)

Not specified in your brief beyond "add tests." Vitest was chosen because it
shares Vite's transform pipeline (fast, ESM-native, zero Babel config) and
has first-class TypeScript support out of the box, which matters more here
than Jest's larger ecosystem — this project has no need for Jest-specific
tooling. React Testing Library is the standard choice for testing components
by behavior rather than implementation detail.

## Route architecture

The live site has 21 real routes (see `docs/ROUTE_INVENTORY.md`). Rather
than 21 near-identical `page.tsx` files, three of the four repeating content
shapes use Next.js dynamic segments with `generateStaticParams`, so each
shape is defined once:

- **`src/app/[slug]/page.tsx`** — the 8 blog-style content pages
  (`/about-axon`, `/how-we-work`, etc.) **and** the 3 legal pages
  (`/privacy-policy`, etc.) share this one dynamic route. They're combined
  here (rather than split into a second `[legalSlug]` route) because
  Next.js doesn't allow two differently-named dynamic segments at the same
  path level — and conceptually they're both "content pages," which matches
  how the live site itself treats them (the `/articles` listing groups
  legal pages alongside blog posts under a "Legal" category — see
  `docs/ROUTE_INVENTORY.md`).
- **`src/app/services/[slug]/page.tsx`** — all 7 service pages, which follow
  an identical live-site structure (What We Do / Why This Works / Who This
  Is For / CTA — confirmed identical across all 7 during Phase 0).
- **`/`, `/pricing`, `/articles`** keep their own dedicated `page.tsx` files
  because each has a genuinely unique layout not shared by any other route.

Static routes always win over the dynamic segment at the same level (Next.js
resolves `/pricing` before ever considering `[slug]`), so there's no
collision risk.

## Content layer (`src/content/`)

Every page's copy lives in typed modules under `src/content/`, generated
from the Phase 0 crawl data and hand-verified against `docs/ROUTE_INVENTORY.md`
— not retyped by hand, to avoid transcription drift from the live source.
Components never hardcode copy; they import from `src/content/*` and render
it. This is the "single source of truth" your brief asked for: navigation
links, service copy, article copy, legal text, and FAQ items each have
exactly one authoritative definition.

One deliberate content correction: `src/content/homepage.ts`'s
`HOME_ARTICLES_SECTION.featuredSlugs` links each card to the article whose
title actually matches it, fixing the live site's mislinked homepage cards
(approved decision — see `docs/CURRENT_SITE_AUDIT.md` §1 and
`docs/RECONSTRUCTION_REPORT.md`). `src/content/articlesListing.ts` is
untouched, since that listing's links were already correct on the live site.

## Client/server boundary

Everything is a Server Component by default. `"use client"` is used only
where the live site has real interactivity:

- `Navigation.tsx` / `MobileMenu.tsx` — the Services dropdown and the mobile
  nav overlay need local open/closed state.
- `Accordion.tsx` — the FAQ accordion's expand/collapse state.
- `DemoModalContext.tsx` / `DemoModal.tsx` / `DemoCtaButton.tsx` — the
  demo-request modal's open state, form state, and validation.
- `CookieConsent.tsx` — reads/writes `localStorage`, so it must run client-side;
  uses `useSyncExternalStore` rather than an effect + `setState`, per
  `eslint-plugin-react-hooks`'s `set-state-in-effect` rule (see the code
  comments in that file and in `MobileMenu.tsx`/`DemoModal.tsx` for the two
  other places this pattern applies: closing the mobile menu on route change,
  and resetting the form when the modal opens — both are adjusted during
  render itself instead of in an effect, per
  [React's own guidance](https://react.dev/learn/you-might-not-need-an-effect)).

No component makes a third-party network call — there's nothing to make one
to yet (see `docs/BACKEND_REQUIREMENTS.md`).

## Design tokens

Colors, spacing, and the `Space Grotesk` font are defined as CSS custom
properties in `src/app/globals.css`, extracted by eye from the live site's
rendered output and reference screenshots (`docs/reference-screenshots/`) —
**not** from an original design file, which doesn't exist publicly (see
"What could NOT be recovered" in `docs/LIVE_SITE_INVENTORY.md`). Treat exact
hex values as close approximations, not confirmed brand constants, until you
can supply or confirm the originals.
