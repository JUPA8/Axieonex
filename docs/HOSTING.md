# Hosting

The application is host-agnostic. It uses no platform SDK, declares no
platform package, and has no `middleware.ts`. What follows is what a host has
to supply, and the two places where a host's identity still leaks into
behaviour.

## Build

```
pnpm run build
```

`prisma generate` then `next build`. It reads no credentials and contacts no
database, so it succeeds on a clean checkout with an empty environment.

**Migrations are not part of the build.** `prisma migrate deploy` is a
controlled operation run once against the Production database and verified
separately. A build command that migrates would re-run schema changes on every
deployment, including rollbacks, which is how a rollback turns into an
outage.

## Indexing

`SITE_INDEXING_ENABLED` decides whether the deployment may be indexed. It is
read by `src/lib/indexing.ts` and consumed by `robots.ts` and the
`X-Robots-Tag` header.

| Value | Result |
| --- | --- |
| `true` | Indexable. `robots.txt` allows all and publishes the sitemap. |
| `false` | `X-Robots-Tag: noindex, nofollow`, `robots.txt` disallows all, no sitemap. |
| absent | Falls back to `VERCEL_ENV`, and to **no indexing** on any other host. |

Two consequences worth stating plainly:

- A new host with no configuration is **not** indexable. That is the point.
  The previous behaviour relied on `VERCEL_ENV` existing, so any other host
  would have gone live in search results with no signal at all.
- The value is baked in at build time, so flipping it needs an environment
  change **and** a fresh deployment. Restarting is not enough.

`NEXT_PUBLIC_SITE_URL` is separate and governs canonicals, Open Graph URLs and
the sitemap's own entries. Point it at the real hostname of the deployment it
is building, never at the intended final domain, until that domain is actually
serving. `src/lib/site.ts` falls back to `https://www.axieonex.com` when it is
unset, which is correct for the launched site and wrong everywhere else, so
set it explicitly on every host.

## Trusted client IP

`TRUSTED_PROXY_IP_HEADER` names the single header the host's edge guarantees.
`src/lib/security/getClientIp.ts` reads only that header, and rejects anything
that is not one bare IP, so a comma-separated forwarded chain fails closed to
`"unknown"` rather than trusting the first entry.

Set it only to a header the host **injects or overwrites**. A header a client
can set end to end is not a trusted source, and pointing this at one hands
every visitor the ability to choose their own rate-limit bucket.

| Host | Header |
| --- | --- |
| Vercel | `x-real-ip` |
| Netlify | `x-nf-client-connection-ip` |

Confirm against a real deployed request before trusting a new host's value.

## Host-specific behaviour that remains

Two places still branch on `VERCEL_ENV`. Neither is a bug, but both are worth
knowing when moving hosts:

- `src/lib/security/rateLimit.ts` fails closed when `NODE_ENV` is
  `production` **or** when on Vercel. A production build on any host fails
  closed, so this is safe as written.
- `src/app/api/consent/route.ts` has a CSRF origin check that reads
  `x-forwarded-host` / `x-forwarded-proto` on Vercel, and the `Host` header
  plus the request URL's protocol elsewhere. Behind a proxy that terminates
  TLS and forwards over HTTP, the second path can compare `https` against
  `http` and reject every request. Verify the consent banner persists a choice
  on a new host before trusting it.

## Required environment

Set on the Production context only. Mark the starred ones secret.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` * | Direct, unpooled endpoint. Prisma migrations are unreliable through a transaction pooler. |
| `AUTH_SECRET` * | Per-environment. Never shared with another deployment. |
| `NEXT_PUBLIC_SITE_URL` | The hostname this build will actually serve on. |
| `CAPTCHA_SITE_KEY` | Public by design; embedded in page HTML. |
| `CAPTCHA_SECRET` * | |
| `UPSTASH_REDIS_REST_URL` * | REST endpoint, not the `redis://` URI. |
| `UPSTASH_REDIS_REST_TOKEN` * | |
| `TRUSTED_PROXY_IP_HEADER` | See above. |
| `EMAIL_PROVIDER_API_KEY` * | Resend, scoped to the sending domain. |
| `EMAIL_FROM_ADDRESS` | Must be on the verified sending domain. |
| `EMAIL_NOTIFICATION_RECIPIENT` | A single address. No CC or BCC exists. |
| `SITE_INDEXING_ENABLED` | Omit, or `false`, until launch. |

Unset variables degrade honestly rather than failing: no Calendly URL makes
booking show as unavailable, no CRM key leaves `crmState` as `DISABLED`, and
no email configuration reports `not_configured` instead of pretending to send.
Upstash is the exception: if it is missing, anti-abuse fails **closed** in
production and submissions are rejected.
