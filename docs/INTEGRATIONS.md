# Integration status

This is the repository source of truth for runtime integrations, configuration
pairs, and behavior when credentials are absent. There are no silent-success
integration mocks in the production application.

## Environment variables

Every operator-supplied runtime variable below is declared without a value in
`.env.example`. Never commit real values.

| Variable | Requirement | Purpose and absent behavior |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical, Open Graph, and sitemap base URL. Code uses the existing canonical-site fallback when absent. |
| `DATABASE_URL` | Required | PostgreSQL connection for submissions, bookings, consent, admins, and articles. Database-backed operations are unavailable when absent. |
| `AUTH_SECRET` | Required for admin | Auth.js session signing. Admin authentication is unavailable when absent. |
| `EMAIL_PROVIDER_API_KEY` + `EMAIL_FROM_ADDRESS` | Optional pair | Resend notifications. Both absent skips email; partial configuration is an error. Stored submissions remain intact. |
| `CAPTCHA_SITE_KEY` + `CAPTCHA_SECRET` | Required pair in production | Turnstile. Production fails closed if absent or invalid. Local/test fail open only when both are absent. |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Required pair in production | Rate limiting. Production fails closed if absent or unavailable. Local/test fail open only when both are absent. |
| `TRUSTED_PROXY_IP_HEADER` | Owner decision | Exact single-value header overwritten by the approved proxy. Unset or invalid produces the safe `unknown` identity. |
| `NEXT_PUBLIC_CALENDLY_URL` | Required for booking | Calendly embed URL. Booking scheduling remains unavailable when absent. |
| `CALENDLY_WEBHOOK_SIGNING_KEY` + `CALENDLY_WEBHOOK_USER_URI` | Required pair for booking | Signature key and exact account URI. Missing either keeps scheduling unavailable and confirmation impossible. |
| `CRM_API_KEY` | Optional | HubSpot contact upsert. When absent, the database write remains successful and `crmSyncedAt` remains null. |
| `CRM_WORKSPACE_ID` | Optional | Additional HubSpot workspace property, only sent when configured. |
| `ANALYTICS_PROVIDER_ID` | Optional | Plausible domain. The script is absent unless configured and analytics consent is active. |
| `ERROR_MONITORING_DSN` | Optional | Sentry DSN for server, edge, and client monitoring. Sentry does not initialize when absent. |

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are deliberately **not** in `.env.example`:
they're optional one-off inputs to `scripts/create-admin.ts` (CLI args or an
interactive prompt work too), not app runtime config, and persisting an
admin password in a file is exactly the anti-pattern this project avoids.
See the script's own header comment.

`NODE_ENV`, `NEXT_RUNTIME`, and `VERCEL_ENV` are read by framework/runtime code
but are platform-controlled, not owner-supplied application settings. They are
therefore intentionally absent from `.env.example`. `VERCEL_ENV=preview`
causes every Preview response to include `X-Robots-Tag: noindex, nofollow`;
production does not receive that preview-only header.

## Current implementation status

| Integration | Status | Notes |
|---|---|---|
| Contact form persistence | **Real** | `ContactSubmission` in Postgres via Prisma. Writes first; a failed/unconfigured email or CRM push never loses the submission. |
| Booking request persistence | **Real** | A `PENDING` row is created before the Calendly embed is revealed. Only a verified Calendly webhook can change it to `CONFIRMED`; `calendarBookingUid` is the signed payload's event URI. |
| Email notifications | **Real, optional** | Resend, gated on `EMAIL_PROVIDER_API_KEY` + `EMAIL_FROM_ADDRESS`. Unset: submissions still persist, `emailSentAt` stays null, and the operation state is `DISABLED`. |
| Honeypot spam protection | **Real** | Hidden field on both public forms; a filled value is silently treated as success. |
| Turnstile spam protection | **Real** | Site key and secret are an atomic pair. Half-configuration always fails; production fails closed when both are absent. Local development and tests fail open only when both are absent. |
| Rate limiting | **Real** | Upstash URL and token are an atomic pair. Production fails closed when absent or unavailable; local development and tests fail open only when both are absent. |
| Admin authentication | **Real** | Auth.js Credentials, bcrypt, signed JWTs with an explicit 8-hour lifetime, active-row revalidation, and an HttpOnly SameSite=Lax session cookie that is Secure in production. |
| Admin data management | **Real** | `/admin` provides independent 20-record server-side pages for contacts and bookings. Authenticated detail routes expose safe operational fields, UTC creation/update times, and persisted provider states while excluding IP addresses and raw correlation identifiers. Articles show draft/published state plus creation/update times. |
| Calendar scheduling | **Real** | Calendly inline embed (`src/components/booking/CalendlyEmbed.tsx`), gated on the public URL and both server-only webhook variables. Calendly owns availability and sends a signed `invitee.created` webhook. Browser `postMessage` events only trigger a status read and are never trusted as confirmation. |
| CRM push | **Real, optional** | HubSpot Contacts API v3 email-keyed batch upsert updates or creates without duplicate contacts; only a validated successful response sets `crmSyncedAt` and `SUCCEEDED`. Missing configuration is recorded as `DISABLED`, while a configured unsuccessful operation is `FAILED`. |
| Article content | **Real** | `Article` model in Postgres, admin CRUD at `/admin/articles`. `/insights` and `/insights/[slug]` read published rows only (`src/lib/articles.ts`); `src/content/articles.ts` is now only the one-time seed source (`prisma/seed.ts`), not read by the live app. |
| Cookie consent persistence | **Real** | `ConsentRecord` in Postgres (`src/app/api/consent/route.ts`), correlated to the visitor via an httpOnly cookie, not a third-party tracker. `localStorage` (`src/lib/consent.ts`) is a fast synchronous read cache in front of it, reconciled on load by `ConsentSync`; a failed server write is logged but never rolls back the visitor's in-browser choice. |
| Analytics | **Real, optional** | Plausible Analytics (`src/components/analytics/AnalyticsScript.tsx`), gated on `ANALYTICS_PROVIDER_ID` **and** live analytics consent (re-checked on every consent change, not just at page load). Unset, or consent not granted: the script never renders, not even a disabled/stubbed tag. |
| Error monitoring | **Real, optional** | Sentry (`@sentry/nextjs`), gated on `ERROR_MONITORING_DSN`. Covers server, edge, and client runtimes (`sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation-client.ts`) plus root-layout render crashes (`src/app/global-error.tsx`). Unset: `Sentry.init()` is never called anywhere, verified by a full production build with the var absent. |
| SEO structured data | **Real** | Organization schema on `/`, Service schema on all 7 `/services/[slug]` pages, Article schema on `/insights/[slug]` (`src/lib/structuredData.ts`). Article schema uses the byline already rendered on every article page ("Axieonex editorial team", `ArticleTemplate.tsx`) as an Organization-type `author`, and the real `Article.publishedAt` column (now exposed through `src/lib/articles.ts`) as `datePublished`; both are real, already-approved facts, not invented ones. |

## Architecture notes for future phases

- **Provider failure policy**: HubSpot and Resend are secondary to the
  durable database write, so their absence, timeout, malformed response, or
  non-2xx response never loses a stored submission. Success timestamps remain
  null unless success is proven. A separate safe state records `NOT_ATTEMPTED`,
  `DISABLED`, `SUCCEEDED`, `FAILED`, or `LEGACY_UNKNOWN`; it does not store
  provider response bodies or failure details. Calls have a five-second
  deadline and logs exclude payloads, credentials, and provider response
  bodies. Turnstile and Upstash fail closed in production;
  development/tests fail open only when fully unconfigured.
- **Proxy identity boundary**: no forwarding header is trusted by default.
  `TRUSTED_PROXY_IP_HEADER` must name a single-value header that the selected
  proxy removes from inbound traffic and overwrites. Lists and malformed
  addresses resolve to `unknown`, grouping callers instead of bypassing limits.
- **Security headers**: CSP, nosniff, strict referrer policy, restrictive
  permissions policy, and `frame-ancestors 'none'` apply globally. HSTS is
  emitted only for production HTTPS configuration. CSP origins are limited to
  those required by Calendly, Turnstile, Plausible, and configured Sentry.
- **Dependency audit residuals**: Prisma 7.10.0 is the latest stable release.
  Its tooling graph includes vulnerable `deepmerge-ts` 7.1.5 and `mysql2`
  3.15.3. This PostgreSQL app never imports the MySQL driver; deepmerge is in
  Prisma configuration tooling, not request handling. No override masks them.

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
- Calendly integration is isolated in `CalendlyEmbed`, `calendlyWebhook`, and
  the webhook route. HubSpot remains isolated in `src/lib/crm.ts` so provider
  changes do not spread through persistence modules.
- `@sentry/nextjs` v10 deprecated `withSentryConfig` on its main entry point;
  it must be imported from `@sentry/nextjs/config` (`next.config.ts`). The
  client-side DSN is inlined via `next.config.ts`'s `env` map so
  `src/instrumentation-client.ts` can gate on the same `ERROR_MONITORING_DSN`
  var as the server/edge configs, instead of requiring a duplicate
  `NEXT_PUBLIC_`-prefixed copy; a Sentry DSN is a public identifier by
  design, so shipping it to the browser is the intended, documented usage.
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
