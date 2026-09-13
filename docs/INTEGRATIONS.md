# Integration status

Tracks what's real vs mocked in this repo. This repo doesn't carry a copy of
the design handoff's `axieonex-integrations.json` (that file lives in the
separate handoff package), so this document is the source of truth for
integration status going forward. Updated at the end of each backend phase.

## Environment variables

Every variable below is declared, empty, in `.env.example`. This table exists
so no variable introduced across the three backend phases is undocumented in
prose form too; see the integration table further down for behavior when a
given variable is unset.

| Variable | Phase | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Frontend | Canonical/OG URLs, sitemap. Defaults to `https://www.axieonex.com` in code if unset. |
| `DATABASE_URL` | 1 | Postgres connection string (Prisma). |
| `AUTH_SECRET` | 1 | Auth.js v5 session-signing secret. |
| `EMAIL_PROVIDER_API_KEY` / `EMAIL_FROM_ADDRESS` | 1 | Resend notification email on submission. |
| `CAPTCHA_SITE_KEY` / `CAPTCHA_SECRET` | 1 | Cloudflare Turnstile spam protection. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | 1 | Upstash rate limiting. |
| `CALENDAR_PROVIDER_API_KEY` / `CALENDAR_ID` | 2 | Cal.com API v2 availability + booking. |
| `CRM_API_KEY` / `CRM_WORKSPACE_ID` | 2 | HubSpot Contacts API v3 push. |
| `ANALYTICS_PROVIDER_ID` | 3 | Plausible Analytics domain, gated on consent. |
| `ERROR_MONITORING_DSN` | 3 | Sentry DSN (server, edge, and client). |

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are deliberately **not** in `.env.example`:
they're optional one-off inputs to `scripts/create-admin.ts` (CLI args or an
interactive prompt work too), not app runtime config, and persisting an
admin password in a file is exactly the anti-pattern this project avoids.
See the script's own header comment.

## Current status (after Backend Phase 3)

| Integration | Status | Notes |
|---|---|---|
| Contact form persistence | **Real** | `ContactSubmission` in Postgres via Prisma. Writes first; a failed/unconfigured email or CRM push never loses the submission. |
| Booking request persistence | **Real** | `BookingRequest` in Postgres. `status` is `PENDING` until a real calendar confirms it, then `CONFIRMED`. |
| Email notifications | **Real, optional** | Resend, gated on `EMAIL_PROVIDER_API_KEY` + `EMAIL_FROM_ADDRESS`. Unset: submissions still persist, `emailSentAt` stays null. |
| Honeypot spam protection | **Real** | Hidden field on both public forms; a filled value is silently treated as success. |
| Turnstile spam protection | **Real, optional** | Gated on `CAPTCHA_SITE_KEY` (client) / `CAPTCHA_SECRET` (server). Unset: widget doesn't render, server verification is skipped, honeypot + rate limiting still apply. |
| Rate limiting | **Real, optional** | Upstash sliding window (5 / 10 min) on both public forms and admin login, gated on `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. Unset: skipped (logged once), not enforced. |
| Admin authentication | **Real** | Auth.js v5, Credentials provider, bcrypt, JWT sessions, session-signed with `AUTH_SECRET`. `/admin` gated by a server-side session check in `src/app/admin/(dashboard)/layout.tsx`. |
| Admin submissions list | **Real** | `/admin` lists `ContactSubmission` and `BookingRequest` rows directly from Postgres, including calendar confirmation UID. |
| Calendar availability + booking | **Real, optional, unverified against a live account** | Cal.com API v2 (`src/lib/calendar/calcom.ts`), gated on `CALENDAR_PROVIDER_API_KEY` + `CALENDAR_ID`. Unset or on any API failure: falls back to the Phase 1 mocked next-4-weekdays generator and the request stays `PENDING`. Implemented against Cal.com's documented v2 shapes but not exercised against a real account (none was available); verify before relying on it in production. |
| CRM push | **Real, optional, unverified against a live account** | HubSpot Contacts API v3 (`src/lib/crm.ts`), gated on `CRM_API_KEY` (`CRM_WORKSPACE_ID` is optional, attached only as an informational custom property if set). Same caveat as Cal.com: implemented against HubSpot's documented shape, not tested against a live account. `crmSyncedAt` is set on both submission models when the push succeeds. |
| Article content | **Real** | `Article` model in Postgres, admin CRUD at `/admin/articles`. `/insights` and `/insights/[slug]` read published rows only (`src/lib/articles.ts`); `src/content/articles.ts` is now only the one-time seed source (`prisma/seed.ts`), not read by the live app. |
| Cookie consent persistence | **Real** | `ConsentRecord` in Postgres (`src/app/api/consent/route.ts`), correlated to the visitor via an httpOnly cookie, not a third-party tracker. `localStorage` (`src/lib/consent.ts`) is a fast synchronous read cache in front of it, reconciled on load by `ConsentSync`; a failed server write is logged but never rolls back the visitor's in-browser choice. |
| Analytics | **Real, optional** | Plausible Analytics (`src/components/analytics/AnalyticsScript.tsx`), gated on `ANALYTICS_PROVIDER_ID` **and** live analytics consent (re-checked on every consent change, not just at page load). Unset, or consent not granted: the script never renders, not even a disabled/stubbed tag. |
| Error monitoring | **Real, optional** | Sentry (`@sentry/nextjs`), gated on `ERROR_MONITORING_DSN`. Covers server, edge, and client runtimes (`sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation-client.ts`) plus root-layout render crashes (`src/app/global-error.tsx`). Unset: `Sentry.init()` is never called anywhere, verified by a full production build with the var absent. |
| SEO structured data | **Real** | Organization schema on `/`, Service schema on all 7 `/services/[slug]` pages, Article schema on `/insights/[slug]` (`src/lib/structuredData.ts`). Article schema uses the byline already rendered on every article page ("Axieonex editorial team", `ArticleTemplate.tsx`) as an Organization-type `author`, and the real `Article.publishedAt` column (now exposed through `src/lib/articles.ts`) as `datePublished`; both are real, already-approved facts, not invented ones. |

## Architecture notes for future phases

- **Prisma 7 driver adapters**: this schema has no `datasource.url`. Prisma
  7 moved connection config to `prisma.config.ts` (CLI) and a
  `@prisma/adapter-pg` adapter passed to `PrismaClient` at runtime
  (`src/lib/prisma.ts`). Don't add `url = env("DATABASE_URL")` back to
  `schema.prisma`; it's no longer valid syntax in this version.
- `src/lib/prisma.ts` exports a **Proxy**, not an eagerly-constructed
  client. Constructing `PrismaClient` without `DATABASE_URL` throws
  immediately (not on first query), so eager construction would crash at
  module-import time before any caller's try/catch could catch it. Keep
  using `prisma.<model>.<op>()` through the exported proxy; don't
  instantiate a second `PrismaClient` elsewhere in app code.
- Auth.js is Credentials-only with **no `@auth/prisma-adapter`**. That
  adapter persists OAuth accounts/DB sessions, neither of which applies
  here (Credentials always uses JWT sessions regardless of adapter). If a
  later phase adds an OAuth provider, this decision should be revisited.
- `/insights` and `/insights/[slug]` are `export const dynamic =
  "force-dynamic"` (content is admin-editable, must not freeze at build
  time). The homepage's Insights preview instead uses `export const
  revalidate = 300` on `src/app/page.tsx`, a middle ground so the mostly-
  static homepage isn't fully dynamic just for one embedded section.
- `Article.category` is free text (admin-editable), not the 4-value enum
  the originally seeded content happened to use. `InsightsInteractive`
  derives its filter chips from whatever categories are actually present in
  the data, not a hardcoded list.
- Both `src/lib/calendar/calcom.ts` and `src/lib/crm.ts` are isolated
  single-file provider modules specifically so swapping providers later
  (Google Calendar instead of Cal.com, a different CRM) means replacing one
  file, not hunting through `contactProvider.ts`/`bookingProvider.ts`.
- `@sentry/nextjs` v10 deprecated `withSentryConfig` on its main entry point;
  it must be imported from `@sentry/nextjs/config` (`next.config.ts`). The
  client-side DSN is inlined via `next.config.ts`'s `env` map so
  `src/instrumentation-client.ts` can gate on the same `ERROR_MONITORING_DSN`
  var as the server/edge configs, instead of requiring a duplicate
  `NEXT_PUBLIC_`-prefixed copy; a Sentry DSN is a public identifier by
  design, so shipping it to the browser is the intended, documented usage.
- Consent is intentionally two-layer: `localStorage` stays the synchronous
  source every consent-gated script checks (so `AnalyticsScript` never
  blocks on a network round trip), while Postgres via `/api/consent` is the
  durable, auditable copy. `writeConsent()` updates the local cache before
  attempting the server write for exactly this reason; don't reorder it to
  await the network call first.
