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
| `NEXT_PUBLIC_CALENDLY_URL` | 2 (revised) | Calendly inline embed URL for the final booking step. |
| `CALENDLY_WEBHOOK_SIGNING_KEY` / `CALENDLY_WEBHOOK_USER_URI` | Security repair | Server-only signature key and expected Calendly account URI for booking confirmation. Both are required. |
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
| Booking request persistence | **Real** | A `PENDING` row is created before the Calendly embed is revealed. Only a verified Calendly webhook can change it to `CONFIRMED`; `calendarBookingUid` is the signed payload's event URI. |
| Email notifications | **Real, optional** | Resend, gated on `EMAIL_PROVIDER_API_KEY` + `EMAIL_FROM_ADDRESS`. Unset: submissions still persist, `emailSentAt` stays null. |
| Honeypot spam protection | **Real** | Hidden field on both public forms; a filled value is silently treated as success. |
| Turnstile spam protection | **Real, optional** | Gated on `CAPTCHA_SITE_KEY` (client) / `CAPTCHA_SECRET` (server). Unset: widget doesn't render, server verification is skipped, honeypot + rate limiting still apply. |
| Rate limiting | **Real, optional** | Upstash sliding window (5 / 10 min) on both public forms and admin login, gated on `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. Unset: skipped (logged once), not enforced. |
| Admin authentication | **Real** | Auth.js v5, Credentials provider, bcrypt, JWT sessions, session-signed with `AUTH_SECRET`. `/admin` gated by a server-side session check in `src/app/admin/(dashboard)/layout.tsx`. |
| Admin submissions list | **Real** | `/admin` lists `ContactSubmission` and `BookingRequest` rows directly from Postgres, including calendar confirmation UID. |
| Calendar scheduling | **Real** | Calendly inline embed (`src/components/booking/CalendlyEmbed.tsx`), gated on the public URL and both server-only webhook variables. Calendly owns availability and sends a signed `invitee.created` webhook. Browser `postMessage` events only trigger a status read and are never trusted as confirmation. |
| CRM push | **Real, optional, verified end-to-end against the live AXIEONEX HubSpot account** | HubSpot Contacts API v3 (`src/lib/crm.ts`), gated on `CRM_API_KEY`. Confirmed by submitting a real request through the live site and observing `crmSyncedAt` get set. This required creating two custom contact properties in the HubSpot account itself (`axieonex_source`, `axieonex_message`) that the code writes to but that don't exist by default in a fresh HubSpot account; the Private App also needed the `crm.schemas.contacts.write` scope (in addition to `crm.objects.contacts.write`) to create them. `CRM_WORKSPACE_ID` is optional; if it's ever set, a third custom property (`axieonex_workspace_id`) will need to be created the same way, since it isn't yet. |
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
- **Cal.com → Calendly**: Phase 2 originally implemented a Cal.com API v2
  integration (`src/lib/calendar/calcom.ts`) for calendar scheduling, but it
  was never exercised against a real account. It's since been replaced
  entirely (not kept alongside) with a real Calendly inline embed once a
  real Calendly link was provided, since Calendly was the actual provider in
  use. The old Cal.com module, its mocked-availability fallback
  (`src/lib/availability.ts`), and `SlotSelector.tsx` were deleted rather
  than left as unused dead code; revisit `git log` on this file before
  Phase 2's tag if Cal.com is ever reconsidered.
- The Book Strategy Call wizard gates the Calendly embed itself behind
  consent + honeypot + Turnstile + rate-limit checks
  (`verifyBookingGateAction` in `src/app/book-strategy-call/actions.ts`),
  run *before* the widget is ever revealed. This differs from the contact
  form's pattern (where a honeypot trip can safely "pretend success" after
  the fact): revealing a live scheduling calendar is itself the sensitive
  action, since a bot that reaches it could spam real slots on the real
  calendar, not just waste a database row.
- Create a user-scoped Calendly webhook subscription for `invitee.created`,
  supplying `CALENDLY_WEBHOOK_SIGNING_KEY` as the subscription signing key.
  Set `CALENDLY_WEBHOOK_USER_URI` to the exact user URI Calendly returns as
  `created_by`. The webhook endpoint is `/api/webhooks/calendly`. The server
  correlates the signed payload through the opaque `utm_content` value added
  to the embed and treats repeat or concurrent deliveries idempotently.
- Consent is intentionally two-layer: `localStorage` stays the synchronous
  source every consent-gated script checks (so `AnalyticsScript` never
  blocks on a network round trip), while Postgres via `/api/consent` is the
  durable, auditable copy. `writeConsent()` updates the local cache before
  attempting the server write for exactly this reason; don't reorder it to
  await the network call first.
