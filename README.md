# AXIEONEX

The production Next.js implementation of the approved AXIEONEX Claude Design
handoff: the AI-orchestrated, human-executed revenue systems marketing site.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Components by default)
- **TypeScript** (strict mode)
- **Tailwind CSS 4**, with the approved design tokens wired in via `@theme`
- **Framer Motion** for the page-transition system and entrance animation
- **Postgres + Prisma 7** (driver adapters, see `docs/INTEGRATIONS.md`) for
  contact/booking persistence and the admin area
- **Auth.js v5** (Credentials + bcrypt + JWT sessions) for `/admin`
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

# Apply Prisma migrations to DATABASE_URL (local dev)
pnpm db:migrate

# Apply already-committed migrations (CI/production)
pnpm db:deploy

# Browse the database
pnpm db:studio

# Create (or reset the password for) an admin account
pnpm admin:create
```

## Backend setup (local)

1. Provision a Postgres database (Neon, Vercel Postgres, or `docker run -p
   5432:5432 -e POSTGRES_PASSWORD=... postgres:16-alpine` for local dev).
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and
   `AUTH_SECRET` (`openssl rand -base64 32`) at minimum; everything else
   degrades gracefully when unset (see `docs/INTEGRATIONS.md`).
3. `pnpm db:migrate` to create the schema.
4. `pnpm admin:create` to create your first admin login, then sign in at
   `/admin/login`.

## Project structure

```
prisma/                    schema.prisma, migrations/
scripts/                    create-admin.ts (CLI, never invents credentials)
src/
  app/                    routes, layouts, metadata, sitemap.ts, robots.ts, not-found.tsx
    admin/                 /admin/login (public) and /admin (session-gated dashboard)
    api/auth/[...nextauth]/ Auth.js route handler
    services/[slug]/      the 7 service-detail routes
    insights/[slug]/      the 6 article routes
  components/
    brand/                 BrandMark (the canonical X geometry)
    transition/             PageTransitionProvider + TransitionLink (route transitions)
    layout/                 SiteHeader, MobileNavigation, Footer
    motion/                 RevealController (the shared [data-reveal] scroll system)
    security/               TurnstileWidget
    ui/                     Button, Container, FAQ, CtaSection
    home/, about/, how-we-work/, services/, pricing/, insights/, article/,
    contact/, booking/, legal/, cookie-preferences/, not-found/
                             page-specific sections and interactive islands
  content/                  typed content modules, the single source of truth for copy
  lib/                      site constants, consent storage, validation, provider boundaries
    prisma.ts               Prisma client singleton (driver-adapter based, see below)
    email.ts                Resend wrapper
    security/               honeypot, Turnstile verification, Upstash rate limiting
  types/                    shared content/booking type definitions
  auth.ts                   Auth.js v5 config
tests/                      Vitest unit and component tests
docs/INTEGRATIONS.md        real vs mocked status, updated per backend phase
```

## What's mocked, and why

Contact and booking submissions are **real**: they persist to Postgres
(see Backend setup above). What's still mocked or unconfigured by default:
calendar availability/confirmation, CRM push, article content (still
titles-only placeholders), analytics, error monitoring, and cookie-consent
persistence (currently `localStorage` only). Every integration point
(`src/lib/contactProvider.ts`, `src/lib/bookingProvider.ts`,
`src/lib/consent.ts`) is a typed, real server-side boundary that honestly
reports "not configured" instead of faking a success response when its
provider isn't set up. See `.env.example` for the full list of variables
and `docs/INTEGRATIONS.md` for the current real-vs-mocked status.
