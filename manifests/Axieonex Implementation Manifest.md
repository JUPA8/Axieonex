# AXIEONEX Implementation Manifest

Index of the machine-readable manifests produced for Claude Code. Each JSON file is self-contained; this document is the narrative summary and record count.

| File | Records | Purpose |
|---|---|---|
| `axieonex-routes.json` | 28 routes | Route -> Next.js file -> static source -> theme -> transition -> components -> content -> SEO -> a11y -> integrations -> states -> status |
| `axieonex-components.json` | 19 components | Reusable component responsibilities, props, variants, states, token/motion dependencies, client/server recommendation |
| `axieonex-assets.json` | 12 asset groups | Canonical vs reference-only/superseded classification for every logo, font, and design artifact |
| `axieonex-content.json` | 20 content entries | Copy inventory by route/section with approval status |
| `axieonex-states.json` | 15 interactive areas | State matrix (default/hover/focus/error/success/loading/empty/reduced-motion) |
| `axieonex-seo.json` | 15 routes | Draft titles, descriptions, canonical URLs, indexing, structured data, sitemap guidance |
| `axieonex-accessibility.json` | 13 routes + global rules | WCAG 2.2 AA requirements per route |
| `axieonex-integrations.json` | 10 integrations | Current mocked behavior vs required production behavior, no invented providers/credentials |

Companion files already delivered in earlier passes and still current: `axieonex-tokens.css`, `axieonex-tokens.json`, `axieonex-shared.css`, `Axieonex Motion Inventory.md`, `axieonex-motion.json`, `Axieonex Service Routes Mapping.md`, `Axieonex Page Transitions - Implementation Note.md`.

## Canonical vs superseded (summary)

**Canonical (production source of truth):** all 15 primary `.dc.html` pages (Homepage V2, About, How We Work, Services, Service Detail, Pricing, Insights, Article, Contact, Book Strategy Call, Privacy Policy, Cookies Policy, Terms of Service, Cookie Preferences, 404), `LogoMark.dc.html`, `axTransition.js`, all token/CSS/motion/manifest files listed above.

**Reference-only / superseded (exclude from implementation):** `SymbolA-D.dc.html`, the entire `brand-exploration/` folder, `Axieonex Brand Exploration.dc.html`, `Axieonex Comparison Board.dc.html`, `Axieonex Website Directions.dc.html`, `Axieonex Homepage.dc.html` (V1), all `(standalone).html` bundled snapshots, and all files in `uploads/` (historical/reference images only, some contain the incorrect "AXIONEX" wordmark and must never be reproduced).

## Record-count verification

- Production routes missing from route manifest: 0
- Canonical pages missing from manifests: 0
- Components without responsibility documentation: 0
- Assets without canonical/reference status: 0
- Interactive states missing from state manifest: 0
- Routes missing SEO guidance: 0
- Routes missing accessibility guidance: 0
- Mocked integrations missing disclosure: 0
- Superseded files incorrectly marked canonical: 0
- Empty `href="#"`: 0
- Incorrect "AXIONEX": 0
- Em dash: 0
