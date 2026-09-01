# Axieonex — Website Reconstruction

A clean, maintainable local reconstruction of [axieonex.com](https://www.axieonex.com/),
built from a Phase 0 audit of the live site (see `docs/`). This is a
**faithful reconstruction, not a redesign** — same routes, same content, same
layout, same brand spelling ("Axieonex" / "AXIEONEX") as observed live. See
`docs/RECONSTRUCTION_REPORT.md` for exactly what was reproduced, what was
intentionally fixed, and what's deferred to later phases.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Components by default)
- **TypeScript** (strict mode)
- **Tailwind CSS 4**
- **ESLint** + the flat config from `eslint-config-next`
- **Vitest** + **React Testing Library** for tests
- Package manager: **pnpm** (already available locally; see
  `docs/ARCHITECTURE.md` for why)

## Commands

```bash
# Install dependencies
pnpm install

# Start the dev server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Run the production build locally
pnpm start

# Lint
pnpm lint

# Type-check (no emit)
pnpm typecheck

# Run the test suite once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Project structure

```
src/
  app/                    routes, layouts, metadata, sitemap.ts, robots.ts, not-found.tsx
    [slug]/               dynamic route: the 8 blog-style content pages + 3 legal pages
    services/[slug]/      dynamic route: the 7 service pages
    pricing/, articles/   the two pages with bespoke, non-templated layouts
  components/
    layout/                Header, Navigation, MobileMenu, Footer, Logo, CookieConsent
    sections/               reusable page sections (Hero, FaqSection, CtaSection, ServiceBody, LegalBody, ...)
    ui/                     Button, Card, Heading primitives, the FAQ Accordion
  features/
    contact/                the demo-request modal: context, form UI, and pure validation logic
    articles/               ArticleCard, ArticleBody renderer
  content/                  typed content modules — the single source of truth for every page's copy
  types/content.ts          shared content type definitions
  lib/                      cn() classnames helper, demo-form select options
docs/                       Phase 0 audit + Phase 1 architecture/reconstruction docs
tests/                      Vitest unit + component tests
public/brand/                the one Axieonex-owned asset reused from the live site (the logo)
```

## What's not here yet

- **No backend.** The demo-request form validates input and clearly says
  delivery isn't configured — it never fakes a successful submission. See
  `docs/BACKEND_REQUIREMENTS.md` for what's needed to wire one up.
- **No visual redesign.** Colors, spacing, and type were reconstructed from
  the live site's rendered output, not an original design file — see
  `docs/RECONSTRUCTION_REPORT.md` for known approximations.
