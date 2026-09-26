# AXIEONEX

Production Next.js implementation of the AXIEONEX marketing site and its
supporting contact, booking, consent, article CMS, and administration flows.

## Stack

- Next.js 16 App Router with Server Components by default
- Node.js 22
- TypeScript in strict mode
- Tailwind CSS 4 and Framer Motion
- PostgreSQL with Prisma 7 and the PostgreSQL driver adapter
- Auth.js Credentials authentication with bcrypt and JWT sessions
- Vitest and React Testing Library
- pnpm

## Routes

Public, indexable routes include `/`, `/about`, `/how-we-work`, `/services`,
the seven `/services/[slug]` pages, `/pricing`, `/insights`, published
`/insights/[slug]` pages, `/contact`, `/privacy`, `/cookies`, and `/terms`.

`/book-strategy-call` and `/cookie-preferences` are public but intentionally
`noindex,follow`. Unknown service/article slugs return a real HTTP 404, and the
404 page is also noindex. `/admin`, `/admin/contacts/[id]`,
`/admin/bookings/[id]`, `/admin/articles`, article editor routes, and
`/admin/login` are private and `noindex,nofollow`.

API routes provide Auth.js, consent persistence, and the signed Calendly
webhook at `/api/auth/[...nextauth]`, `/api/consent`, and
`/api/webhooks/calendly`.

## Local development

```bash
pnpm install
pnpm exec prisma generate
pnpm dev
```

Copy `.env.example` to `.env.local` and provide local-only configuration.
PostgreSQL and `AUTH_SECRET` are needed for database-backed pages and admin
authentication. Completely absent Turnstile and Upstash pairs fail open only
in development and tests; partial or failing provider configuration does not.

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm build
pnpm start
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:seed
pnpm db:studio
pnpm admin:create
```

`pnpm db:migrate` creates development migrations. `pnpm db:deploy` applies
already committed migrations and is the only migration command intended for a
controlled production release. Neither command should be run against a
production database from an unreviewed local branch.

The committed migration history covers the initial submission/admin schema,
article CMS and booking confirmation identity, consent records, the later
admin/Calendly security constraints, and the admin operational-completeness
timestamp/provider-state backfill. Migrations are append-only release
artifacts; schema changes require a new reviewed migration rather than editing
an already-applied file.

## Application behavior

- Contact submissions are validated and persisted to PostgreSQL before the
  optional HubSpot and Resend side effects run. Provider failure cannot remove
  the stored submission. Success timestamps remain null until success, while a
  separate persisted state records not attempted, disabled, succeeded, failed,
  or legacy/unknown outcomes.
- Booking requests are stored as `PENDING` before Calendly is shown. Only a
  correctly signed, account-bound `invitee.created` webhook can set a booking
  to `CONFIRMED`. Browser messages only trigger a server-side status read.
- HubSpot uses an email-keyed contact upsert and stores the latest enquiry
  context without treating conflicts as automatic success.
- Resend sends internal notifications when its key/address pair is configured.
- Turnstile and Upstash are required anti-abuse controls in production and fail
  closed when absent, partial, timed out, or unavailable.
- Admin authentication uses an explicit eight-hour JWT session. Each sensitive
  read or mutation revalidates that the admin row still exists and is active.
- The admin dashboard uses independent, server-side 20-record pages for
  contacts and bookings. Detail views expose operational record fields and UTC
  creation/update times while withholding IP addresses and raw correlation
  identifiers. Protected loading and generic retryable error states do not
  expose record or infrastructure details.
- The article CMS stores drafts and published articles in PostgreSQL. Public
  routes only expose published records; drafts remain private and unindexed.
- Consent is cached in local storage for immediate client gating and persisted
  to PostgreSQL for the audit record. Plausible is inserted only after analytics
  consent and only when configured.
- Sentry initialization is conditional on its DSN. No monitoring client is
  initialized when it is absent.
- Global CSP, frame protection, nosniff, referrer, permissions, and conditional
  production HTTPS HSTS headers are configured in `next.config.ts`.
- Vercel Preview deployments receive a global `X-Robots-Tag: noindex,
  nofollow` header based on Vercel's platform-owned `VERCEL_ENV`. Production
  deployments are not assigned this preview-only header.
- Production builds explicitly use Next.js's supported webpack build mode;
  this is the deployment-tested path for the current `next/font` setup.
- Client IP rate-limit identity trusts no forwarding header by default. The
  deployment owner must select a proxy-normalized, single-value header.

No integration is represented by a silent success mock. An integration is
either implemented, explicitly optional, or reports a defined unavailable
state. See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the complete
environment and failure-policy matrix.

## Project structure

```text
prisma/                       schema and committed migrations
scripts/                      local administration utilities
src/app/                      pages, API routes, metadata, robots and sitemap
src/app/admin/                protected dashboard and article CMS
src/components/               UI and interactive client components
src/content/                  approved marketing/legal source content
src/lib/                      persistence, providers, validation and security
src/types/                    shared application types
tests/                        unit, component, security and metadata tests
docs/INTEGRATIONS.md          environment and integration source of truth
docs/ADMIN-OPERATIONS.md      protected admin data behavior and state meanings
docs/LEGAL-OWNER-CHECKLIST.md unresolved legal owner/counsel questions
```

The former handoff artifacts `README-CLAUDE-CODE.md`, `START-HERE.md`, and
design-package manifests are intentionally not duplicated here. They are not
used by the application or build. This README, `.env.example`, the current
source, and the documents above are canonical for this repository.

## Production prerequisites

Before deployment, the owner must:

1. Approve the target deployment platform and its trusted client-IP header.
2. Configure PostgreSQL, Auth.js, Turnstile, Upstash, Calendly, and the required
   webhook subscription as documented in `docs/INTEGRATIONS.md`.
3. Apply reviewed Prisma migrations with `pnpm db:deploy` and create an active
   administrator through the local administration script.
4. Confirm optional HubSpot, Resend, Plausible, and Sentry configuration if
   those capabilities are intended for the release.
5. Complete and approve `docs/LEGAL-OWNER-CHECKLIST.md`. The current legal pages
   remain structural drafts and are not legally complete.
6. Run lint, typecheck, the full test suite, and a credential-free production
   build from the exact release commit.

## Rollback

Application rollback means redeploying the previously approved commit and
restoring its matching environment configuration. Database migrations are not
automatically reversible: inspect each migration and prepare a reviewed
forward-fix or explicit database rollback before deployment. Do not delete
contact, booking, consent, admin, or article data as part of an application
rollback. Provider-side changes such as Calendly webhook subscriptions,
HubSpot properties, and credential rotation must be rolled back separately by
their owners.
