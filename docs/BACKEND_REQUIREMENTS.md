# Backend Requirements — Demo Request Form

This reconstruction has **no backend**. The "Book Your Free Strategy Call" modal
(`src/features/contact/DemoModal.tsx`) fully validates input client-side
(`src/features/contact/validation.ts`) and, on a valid submission, shows a
message explaining that delivery isn't configured — it never claims success
and never sends the data anywhere. This is intentional, per your Phase 1
instructions: recreate the form interface, don't invent a backend.

## What we know about the live form (from Phase 0 inspection)

- Opening the modal makes **zero network requests** — it's rendered entirely
  client-side on the live site too.
- Submitting the live form was **not tested** (per your explicit instruction
  not to submit real forms), so its actual endpoint, success/failure
  behavior, and downstream handling (email? CRM? database?) are unknown and
  not guessed at anywhere in this codebase.
- The live site's footer contact email is `info@axieonexsales.net` — a
  different domain than `axieonex.com`. Whether the form ultimately delivers
  to that address, a CRM, or something else is unconfirmed.

## What would be needed to wire up a real backend

Before any real integration is implemented, we'd need you to provide and
confirm:

1. **Delivery target.** Where should a submitted lead actually go —
   transactional email (and to which address/inbox), a CRM (HubSpot,
   Salesforce, etc. — which one, and API credentials), a webhook, or a
   database you already run?
2. **Credentials**, issued by you, for whichever target above is chosen —
   never invented or reused from the live site (we have none, by design; see
   docs/CURRENT_SITE_AUDIT.md).
3. **Required vs. optional fields**, and whether server-side validation
   should differ from the client-side rules already implemented in
   `src/features/contact/validation.ts` (currently mirrors the live form
   exactly: 9 required fields + 1 optional 150-character note).
4. **Spam/abuse protection expectations** — e.g. a CAPTCHA, rate limiting, or
   honeypot field. None exists on the live site as observed, but a real
   backend is a realistic spam target the live client-only form isn't.
5. **What "success" should look like** for the user — a confirmation page,
   an email receipt, a redirect, etc.
6. **Data retention / privacy handling** for submitted leads, consistent with
   the site's own Privacy Policy (`/privacy-policy`) once it's decided
   whether that policy's current text still applies to the rebuilt product.

## Suggested shape (once approved)

A Next.js Route Handler (e.g. `src/app/api/demo-request/route.ts`) that:

- Re-validates the payload server-side (reusing `validateDemoForm`).
- Reads its delivery credentials from server-only environment variables (see
  `.env.example`) — never exposed to the client bundle.
- Forwards the lead to the approved delivery target.
- Returns a typed success/error response for the client form to render.

None of this exists yet. This document exists so that work can start quickly
once you've made the decisions above — not to imply it's already built.
