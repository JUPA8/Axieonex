# Service route mapping (for Next.js implementation)

This prototype environment has no server-side router — every page is a static file, and the
Service Detail template is one reusable file that reads its content via `?slug=`. Clean paths
like `/services/lead-generation` cannot physically resolve in this preview; they are Next.js
routes to be created from the App Router when this ships to production.

Do not present the prototype's `?slug=` links as the final production URLs — this file is the
authoritative mapping Claude Code must implement.

| Production route | Template + current prototype link | Service |
|---|---|---|
| `/services/lead-generation` | `Axieonex Service Detail.dc.html?slug=lead-generation` | Lead Generation |
| `/services/appointment-setting` | `Axieonex Service Detail.dc.html?slug=appointment-setting` | Appointment Setting |
| `/services/hybrid-sdr` | `Axieonex Service Detail.dc.html?slug=hybrid-sdr` | Hybrid SDR Service |
| `/services/cold-email` | `Axieonex Service Detail.dc.html?slug=cold-email` | Cold Email and Messaging |
| `/services/linkedin-outreach` | `Axieonex Service Detail.dc.html?slug=linkedin-outreach` | LinkedIn Outreach |
| `/services/cold-calling` | `Axieonex Service Detail.dc.html?slug=cold-calling` | Cold Calling |
| `/services/presales-gtm` | `Axieonex Service Detail.dc.html?slug=presales-gtm` | Pre-Sales and GTM Strategy |

## Implementation note for Claude Code

`Axieonex Service Detail.dc.html`'s template and logic class map directly onto
`app/services/[slug]/page.tsx`: the `SERVICES` object becomes static data (or a CMS lookup) keyed
by the route param instead of a query string, and `getSlug()` becomes `params.slug`. No other
change to markup, styling, or motion is required — the seven distinct hero visuals, the
responsibility-split grid, channels/quality sections, process steps, FAQ and related-services
links all carry over unchanged.
