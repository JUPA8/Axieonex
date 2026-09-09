# Page-transition system: architecture and Next.js handoff

## What's implemented (static prototype)

`axTransition.js` is a single shared controller (`window.AxTransition`), loaded via
`<script src="./axTransition.js"></script>` in every primary page's `<helmet>`. It replaces each
page's earlier per-page transition logic; every page's `navTransition(e)` method is now a two-line
delegate: `if (window.AxTransition) { window.AxTransition.go(e); return; }` with a safe fallback if
the script fails to load.

`AxTransition.go(e)`:
- Ignores modified clicks (cmd/ctrl/shift/alt/middle-click), `#anchors`, `mailto:`, `tel:` links,
  so those still behave natively (in-page anchors, external actions, browser-native new-tab).
- Looks up the destination's signature (hue/saturation/brightness) from a single `DEST` map keyed
  by target filename, with a `SERVICE_DEST` sub-map keyed by `?slug=` for the seven services on
  the shared Service Detail template.
- Applies that signature as a CSS `filter` on the current page's `.axPageTransitionMark` (the
  X mark already mounted in every page), toggles the existing `.axPageTransition` overlay to
  `.is-active`, waits ~720ms, then navigates.
- Under `prefers-reduced-motion: reduce`, skips the travel/filter change entirely and navigates
  after ~120ms behind the overlay's static "on" state, so there is never a blank screen and never
  a scale/morph animation.

Every destination's signature (hue/sat/bri approximating its stated color-and-material identity,
e.g. About's pearl/silver = desaturated + brightened, Pricing's graphite/platinum = near-fully
desaturated, How We Work's cyan/violet = hue-shifted and intensified) is centralized in one file,
so adding or adjusting a destination never requires touching page markup.

## Static-preview limitations

- The overlay's *background color* is still set per-page in that page's own `<style>` (each page
  already had its own tinted overlay from earlier passes); only the *mark's* filter is destination-
  aware via the shared script. A full two-tone "exit through current page's material, arrive in
  destination's material" effect is present but the exit tint is coarser than the arrival tint.
- `.dc.html` files have no real router, so "direct load" and "browser back/forward" are native
  browser behavior (full page load), not a client-side transition; this is correct and expected
  for a static file set, and preserves your requirement that direct loads never replay the
  transition.
- Article and Service Detail pages are one shared template each; the destination signature varies
  by `?slug=`, matching the production intent of one route template per service/article.

## Next.js implementation mapping

Implement this as one client-side `TransitionProvider` (e.g. `app/_transition/TransitionProvider.tsx`)
wrapping the root layout:

- A `DESTINATIONS` metadata object (the `DEST`/`SERVICE_DEST` maps above, ported as-is) keyed by
  route path instead of filename.
- A shared `<Link>` wrapper (or a `useTransitionNavigate()` hook) that intercepts clicks the same
  way `go()` does here (skip modified clicks, anchors, `mailto:`/`tel:`), reads the destination's
  signature from the metadata object by matching `next/navigation`'s resolved pathname, animates
  the persistent X mark (kept mounted in the root layout so it survives route changes without
  remount), then calls `router.push(href)`.
- Because Next.js retains the layout across navigations, the X mark and overlay do not need to be
  duplicated per page as they are here; move both into the shared layout once, and delete the
  per-page overlay markup this prototype currently repeats.
- Use the Web Animations API or Framer Motion for the filter/opacity transition instead of a CSS
  class toggle, so the provider can `await` the exit animation before calling `router.push`,
  keeping timing exact instead of a fixed `setTimeout`.
- Respect `prefers-reduced-motion` via `window.matchMedia`, matching the same short-circuit here.
- `router.back()` / `router.forward()` should NOT trigger the custom transition; only clicks
  through the intercepted `<Link>` should, matching this prototype's behavior of leaving browser
  history navigation untouched.
