# Integration status

Tracks what's real vs mocked in this repo. This repo doesn't carry a copy of
the design handoff's `axieonex-integrations.json` (that file lives in the
separate handoff package), so this document is the source of truth for
integration status going forward. Updated at the end of each backend phase.

## Backend Phase 1, Foundation (this phase)

| Integration | Status | Notes |
|---|---|---|
| Contact form persistence | **Real** | `ContactSubmission` in Postgres via Prisma. Writes first; a failed/unconfigured email never loses the submission. |
| Booking request persistence | **Real** | `BookingRequest` in Postgres, `status: PENDING`. No live calendar check yet, see Phase 2. |
| Email notifications | **Real, optional** | Resend, gated on `EMAIL_PROVIDER_API_KEY` + `EMAIL_FROM_ADDRESS`. Unset: submissions still persist, `emailSentAt` stays null. |
| Honeypot spam protection | **Real** | Hidden field on both public forms; a filled value is silently treated as success. |
| Turnstile spam protection | **Real, optional** | Gated on `CAPTCHA_SITE_KEY` (client) / `CAPTCHA_SECRET` (server). Unset: widget doesn't render, server verification is skipped, honeypot + rate limiting still apply. |
| Rate limiting | **Real, optional** | Upstash sliding window (5 / 10 min) on both public forms and admin login. Unset: skipped (logged once), not enforced. |
| Admin authentication | **Real** | Auth.js v5, Credentials provider, bcrypt, JWT sessions. `/admin` gated by a server-side session check in `src/app/admin/(dashboard)/layout.tsx`. |
| Admin submissions list | **Real** | `/admin` lists `ContactSubmission` and `BookingRequest` rows directly from Postgres. |
| Calendar availability | **Still mocked** | Hardcoded next-4-weekdays × 4 fixed slots (`src/lib/availability.ts`). Phase 2. |
| CRM push | **Still mocked** | `crmSyncedAt` column exists as a seam; nothing writes to it yet. Phase 2. |
| Article content | **Still mocked** | Titles-only placeholders in `src/content/articles.ts`. Phase 2 (DB-backed `Article` model + admin CRUD). |
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
- `BookingRequest.status` (`PENDING` / `CONFIRMED` / `CANCELLED`) and the
  `crmSyncedAt` columns on both submission models are Phase 1 schema seams
  for Phase 2; no code writes anything but `PENDING`/`null` yet.
