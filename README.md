# AXIEONEX

The production Next.js implementation of the approved AXIEONEX Claude Design
handoff: the AI-orchestrated, human-executed revenue systems marketing site.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Components by default)
- **TypeScript** (strict mode)
- **Tailwind CSS 4**, with the approved design tokens wired in via `@theme`
- **Framer Motion** for the page-transition system and entrance animation
- **Vitest** + **React Testing Library** for tests
- Package manager: **pnpm**

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
    services/[slug]/      the 7 service-detail routes
    insights/[slug]/      the 6 article routes
  components/
    brand/                 BrandMark (the canonical X geometry)
    transition/             PageTransitionProvider + TransitionLink (route transitions)
    layout/                 SiteHeader, MobileNavigation, Footer
    motion/                 RevealController (the shared [data-reveal] scroll system)
    ui/                     Button, Container, FAQ, CtaSection
    home/, about/, how-we-work/, services/, pricing/, insights/, article/,
    contact/, booking/, legal/, cookie-preferences/, not-found/
                             page-specific sections and interactive islands
  content/                  typed content modules, the single source of truth for copy
  lib/                      site constants, consent storage, validation, provider boundaries
  types/                    shared content/booking type definitions
tests/                      Vitest unit and component tests
```

## What's mocked, and why

No third-party provider has been selected yet for contact-form delivery,
calendar booking, email notifications, CRM, analytics, or a real
consent-management platform. Each integration point (`src/lib/contactProvider.ts`,
`src/lib/bookingProvider.ts`, `src/lib/consent.ts`) is a typed, real
server-side boundary that honestly reports "not configured" instead of
faking a success response. See `.env.example` for the full list of
variables to fill in once providers are chosen, and
`axieonex-integrations.json` in the design handoff for the complete
integration checklist.
