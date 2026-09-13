# Integration status

Tracks what's real vs mocked in this repo. This repo doesn't carry a copy of
the design handoff's `axieonex-integrations.json` (that file lives in the
separate handoff package), so this document is the source of truth for
integration status going forward. Updated at the end of each backend phase.

## Current status (after Backend Phase 2)

| Integration | Status | Notes |
|---|---|---|
| Contact form persistence | **Real** | `ContactSubmission` in Postgres via Prisma. Writes first; a failed/unconfigured email or CRM push never loses the submission. |
| Booking request persistence | **Real** | `BookingRequest` in Postgres. `status` is `PENDING` until a real calendar confirms it, then `CONFIRMED`. |
| Email notifications | **Real, optional** | Resend, gated on `EMAIL_PROVIDER_API_KEY` + `EMAIL_FROM_ADDRESS`. Unset: submissions still persist, `emailSentAt` stays null. |
| Honeypot spam protection | **Real** | Hidden field on both public forms; a filled value is silently treated as success. |
| Turnstile spam protection | **Real, optional** | Gated on `CAPTCHA_SITE_KEY` (client) / `CAPTCHA_SECRET` (server). Unset: widget doesn't render, server verification is skipped, honeypot + rate limiting still apply. |
| Rate limiting | **Real, optional** | Upstash sliding window (5 / 10 min) on both public forms and admin login. Unset: skipped (logged once), not enforced. |
| Admin authentication | **Real** | Auth.js v5, Credentials provider, bcrypt, JWT sessions. `/admin` gated by a server-side session check in `src/app/admin/(dashboard)/layout.tsx`. |
| Admin submissions list | **Real** | `/admin` lists `ContactSubmission` and `BookingRequest` rows directly from Postgres, including calendar confirmation UID. |
| Calendar availability + booking | **Real, optional, unverified against a live account** | Cal.com API v2 (`src/lib/calendar/calcom.ts`), gated on `CALENDAR_PROVIDER_API_KEY` + `CALENDAR_ID`. Unset or on any API failure: falls back to the Phase 1 mocked next-4-weekdays generator and the request stays `PENDING`. Implemented against Cal.com's documented v2 shapes but not exercised against a real account (none was available); verify before relying on it in production. |
| CRM push | **Real, optional, unverified against a live account** | HubSpot Contacts API v3 (`src/lib/crm.ts`), gated on `CRM_API_KEY`. Same caveat as Cal.com: implemented against HubSpot's documented shape, not tested against a live account. `crmSyncedAt` is set on both submission models when the push succeeds. |
| Article content | **Real** | `Article` model in Postgres, admin CRUD at `/admin/articles`. `/insights` and `/insights/[slug]` read published rows only (`src/lib/articles.ts`); `src/content/articles.ts` is now only the one-time seed source (`prisma/seed.ts`), not read by the live app. |
| Cookie consent persistence | **Still mocked** | `localStorage` only (`src/lib/consent.ts`). Phase 3. |
| Analytics | **Not wired** | Phase 3. |
| Error monitoring | **Not wired** | Phase 3. |

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
