# AXIEONEX Motion Inventory

Documents every animation and interaction currently implemented across the 15 primary pages plus the shared transition controller. Nothing here is proposed or redesigned; each entry reflects working code. See `axieonex-motion.json` for the machine-readable form Claude Code should consume.

## 1. Motion hierarchy and principles

1. Brand motion (page-transition controller, logo entrance) — highest ceremony, lowest frequency.
2. Navigational motion (nav compact/expand, route indicator, mobile menu) — frequent, must be fast.
3. Scroll storytelling (hero reveals, three-stage engine, reveal-on-scroll) — one-time per session per element.
4. Interactive feedback (hover, focus, press, toggle) — instant, always available, unaffected by reduced motion except where noted.
5. Ambient motion (signal dots, pulse rings) — decorative only, never gates content, always has a reduced-motion static fallback.

## 2. Global motion rules

- No element's readability may depend on animation completing (fixed this pass: hero headline, nav logo/CTA no longer use `opacity:0` as a base state).
- Every custom `@keyframes`-driven effect has a paired `@media (prefers-reduced-motion: reduce)` rule.
- All page-transition timing shares one duration (720ms standard, 120ms reduced) from the shared controller, `axTransition.js`.
- IntersectionObserver-driven reveals (`[data-reveal]`) default `.is-in` immediately for any element already in the viewport on mount, so first paint is never blank.

## 3. Route-transition signature matrix

See `Axieonex Page Transitions - Implementation Note.md` for full detail. Summary: `axTransition.js`'s `DEST`/`SERVICE_DEST` maps hold one hue/saturation/brightness signature per destination (Home spectral, About pearl/silver, How We Work cyan/violet, Services cobalt, each of the 7 services individually, Pricing graphite/platinum, Insights/Article aperture, Contact routed, Strategy Call calibrated, Privacy/Cookies/Terms/Cookie Preferences restrained, 404 broken-signal). Applied as a CSS `filter` on the persistent `.axPageTransitionMark`, then overlay fade, then navigation.

## 4. Page-specific hero-motion matrix

| Page | Hero motion concept |
|---|---|
| Home | Signal fragments converge on X mark; staggered headline lines; magnetic CTA |
| About | Sculptural light reveal on embossed mark (page-specific keyframes) |
| How We Work | Signal paths weaving into mark; scroll-pinned stage activation |
| Services | Radial ecosystem diagram; click/hover node activation swaps active service panel |
| Pricing | Assembly-piece entrance (`axAssemblePiece`), calibration ring pulse |
| Insights | Search/filter result rows settle in (`axFragmentSettle`) |
| Article | Reading-progress bar tied to scroll position |
| Contact | Converging dots resolve into one point above the headline |
| Strategy Call | Step-panel slide-in (`axStepIn`), progress dots fill sequentially |
| 404 | Failed signal dots fade in/out around a resolving X mark |

## 5. Service-detail motion matrix (one shared template, `?slug=`)

| Service | Visual | Motion |
|---|---|---|
| Lead Generation | Radar rings + sweeping line | Rotating sweep (`axRadarSweep`), pulsing signal dots |
| Appointment Setting | Calendar + checkmark | Pulsing confirmation ring |
| Hybrid SDR | Two overlapping rings | Independent pulse timing per ring |
| Cold Email | Envelope | Flap bounce (`axEnvelopeFlap`) |
| LinkedIn Outreach | Radial node graph | Staggered node pulse |
| Cold Calling | Concentric rings | Expanding waveform (`axWavePulse`) |
| Pre-Sales/GTM | Blueprint grid | Staggered grid-point pulse |

## 6. Scroll-animation inventory

- `[data-reveal]` family (mask-left/mask-right/scale/slide-lg variants): IntersectionObserver adds `.is-in`, threshold 0.1–0.18 depending on page.
- Homepage three-stage engine: `activeCap` state driven by a per-stage IntersectionObserver at 0.6 threshold; swaps active SVG scene and background tint (`axEngineWorld0/1/2`).
- Article reading-progress bar: scroll-listener computes `scrollTop / (scrollHeight - clientHeight)`.
- Nav compact state: scroll-listener toggles `.axNavCompact` past 40px.

## 7. Interaction-state inventory

- Buttons: default / hover (color or background shift) / focus-visible (2px outline) / disabled (booking submit while `submitting`).
- Form fields: default / focus (border color) / error (`axFieldError` class + inline error text) / disabled (strictly-necessary cookie toggle).
- FAQ `<details>`: closed / open, `+` icon rotates 45° on open.
- Cookie Preferences toggles: on/off with `axSwitch` thumb translate; strictly-necessary is always-on and non-interactive (`checked="{{ true }}" disabled="{{ true }}"`).
- Booking/Strategy Call wizard: step dots fill as `is-done`; back/next/submit buttons show/hide by step; slot buttons show `is-selected`.
- Magnetic buttons (`data-magnetic`): pointer-move translates the button toward the cursor, resets on mouse-leave; disabled entirely under reduced motion.

## 8. Reduced-motion matrix

Every animation family below has a confirmed reduced-motion rule: hero fragments/mark reveal, hero line transforms, engine diagrams (scan/flow/human-ring), capability pulse dots, page-transition overlay (`display:none`, so no transition delay at all), magnetic buttons (handlers not attached), nav entrance, service-detail visuals (radar/envelope/wave), 404 fail-dots/scan-ring/mark-resolve, cookie-preferences switches (no animation was ever needed there beyond CSS transition, which is not gated — this is the one exception, documented below as low-risk since it's a 0.2s color/transform tweak, not a content-hiding animation).

## 9. Performance budget and implementation cautions

- All continuous/ambient animations use `transform`/`opacity`/SVG attribute animation, not layout-triggering properties.
- No `filter: blur()` is used continuously; the only blur usage is a one-shot mark-reveal effect on About, which completes and does not repeat.
- IntersectionObservers are disconnected in `componentWillUnmount` on every page that creates one.
- Ambient pulse animations (`axPulseDot`, `axNodePulse`, `axWavePulse`) are `infinite` but cheap (opacity/scale only) and confined to small SVG regions, not full-viewport.

## 10. Animation ownership mapping (for Next.js componentization)

- `TransitionProvider` (root layout): owns `axTransition.js`'s logic, the persistent mark, and the overlay.
- `NavBar`: owns nav entrance stagger, compact-scroll state, mobile menu open/close.
- `RevealOnScroll` (wrapper component): owns the `[data-reveal]` family.
- `EngineDiagram` (Home-specific): owns the three-stage SVG scene swap.
- `ServiceHeroVisual` (Service Detail-specific): owns the seven per-slug SVG animations, selected by a `visual` prop instead of `sc-if` chains.
- `BookingWizard`: owns step state, validation, slot selection, and step-panel transition.

## 11. Animations relying on fragile opacity-hidden initial states — before this pass

- Homepage `.axHeroLine` (fixed: now animates `transform` only, `opacity` no longer part of the keyframe or base rule).
- Homepage `.axLogoLockup` / `.axNavCta` (fixed: removed from the `opacity:0` entrance rule entirely; they render at full opacity immediately, no animation dependency for visibility).

No other page in the project uses an `opacity:0` **base rule with animation-fill-mode:both** pattern for primary readable text or primary interactive controls; remaining `opacity:0` usages are all on `[data-reveal]`-class elements, which are governed by the audited IntersectionObserver-with-immediate-fallback pattern (see rule in Section 2), not a bare CSS keyframe.

## 12. Duplicated or conflicting keyframe names

- `axNodePulse` is defined independently in `Axieonex Pricing.dc.html` and `Axieonex Service Detail.dc.html` with slightly different timing (2.6s vs 2.4s in variants). Not a bug (each page is self-contained), but Next.js componentization should consolidate into one `pulse` keyframe with a duration prop.
- `axFragmentIn`/`axFragment` naming appears in both the old superseded homepage draft (deleted) and nowhere else currently — no live conflict.

## 13. Items requiring refactoring during Next.js implementation

- Consolidate the ~15 near-identical `navTransition`/page-transition CSS blocks into the single `TransitionProvider` described in the implementation note, removing per-page duplication.
- Consolidate duplicated pulse/wave keyframes (Section 12) into shared animation primitives.
- Port `[data-reveal]`'s manual IntersectionObserver wiring to a single reusable hook/component.
