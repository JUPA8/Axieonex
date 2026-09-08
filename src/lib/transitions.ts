export type DestinationSignature = {
  hue: number;
  sat: number;
  bri: number;
  label: string;
};

const DEFAULT_DESTINATION: DestinationSignature = { hue: 0, sat: 1, bri: 1, label: "default" };

/** Ported from axTransition.js's DEST map, keyed by route path instead of filename. */
const ROUTE_DESTINATIONS: Record<string, DestinationSignature> = {
  "/": { hue: 0, sat: 1.15, bri: 1, label: "spectral convergence" },
  "/about": { hue: 0, sat: 0.12, bri: 1.3, label: "pearl and silver reveal" },
  "/how-we-work": { hue: 20, sat: 1.3, bri: 0.95, label: "signal paths weaving" },
  "/services": { hue: -15, sat: 1.2, bri: 1, label: "cobalt modular assembly" },
  "/pricing": { hue: 0, sat: 0.05, bri: 1.1, label: "graphite and platinum" },
  "/insights": { hue: -30, sat: 1.1, bri: 1, label: "editorial aperture reveal" },
  "/contact": { hue: 15, sat: 1.15, bri: 1, label: "channels routed to one point" },
  "/book-strategy-call": { hue: 5, sat: 1.2, bri: 1, label: "calibrated progression" },
  "/privacy": { hue: -25, sat: 0.4, bri: 1.1, label: "restrained cyan and pearl" },
  "/cookies": { hue: -25, sat: 0.4, bri: 1.1, label: "restrained consent layer" },
  "/terms": { hue: 0, sat: 0.08, bri: 1.1, label: "structured platinum line" },
  "/cookie-preferences": { hue: -25, sat: 0.5, bri: 1.05, label: "category layers resolving" },
};

/** Every /insights/[slug] article shares the "typographic line" signature. */
const ARTICLE_DESTINATION: DestinationSignature = { hue: -30, sat: 1, bri: 1.05, label: "typographic line" };

/** Ported from axTransition.js's SERVICE_DEST map. */
const SERVICE_DESTINATIONS: Record<string, DestinationSignature> = {
  "lead-generation": { hue: 0, sat: 1.2, bri: 1, label: "radar detection and isolation" },
  "appointment-setting": { hue: -330, sat: 1.15, bri: 1, label: "calibrated scheduling alignment" },
  "hybrid-sdr": { hue: -20, sat: 1.1, bri: 1, label: "AI and human layers converging" },
  "cold-email": { hue: -40, sat: 1.15, bri: 1, label: "message path folding through the mark" },
  "linkedin-outreach": { hue: 0, sat: 1.1, bri: 1, label: "network nodes resolving" },
  "cold-calling": { hue: -330, sat: 1.15, bri: 1, label: "waveform convergence" },
  "presales-gtm": { hue: -40, sat: 1.1, bri: 1, label: "blueprint lines locking into position" },
};

const NOT_FOUND_DESTINATION: DestinationSignature = { hue: -330, sat: 1.3, bri: 0.9, label: "broken signal resolving" };

export function getDestinationForPath(pathname: string): DestinationSignature {
  if (ROUTE_DESTINATIONS[pathname]) return ROUTE_DESTINATIONS[pathname];

  const serviceMatch = pathname.match(/^\/services\/([a-z-]+)/);
  if (serviceMatch && SERVICE_DESTINATIONS[serviceMatch[1]]) return SERVICE_DESTINATIONS[serviceMatch[1]];
  if (pathname === "/services" || pathname.startsWith("/services/")) return ROUTE_DESTINATIONS["/services"];

  if (pathname.startsWith("/insights/")) return ARTICLE_DESTINATION;
  if (pathname === "/insights") return ROUTE_DESTINATIONS["/insights"];

  if (pathname === "/404" || pathname === "/not-found") return NOT_FOUND_DESTINATION;

  return DEFAULT_DESTINATION;
}

export function destinationFilter(dest: DestinationSignature): string {
  return `hue-rotate(${dest.hue}deg) saturate(${dest.sat}) brightness(${dest.bri})`;
}

/** True for a plain, unmodified left click that should be intercepted for a client transition. */
export function isPlainLeftClick(event: React.MouseEvent): boolean {
  return !(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

/** True when a href should be left to native browser handling (external, download, in-page anchor, protocol link). */
export function isNativeHref(href: string): boolean {
  if (!href) return true;
  if (href.startsWith("#")) return true;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("/")) return true;
  return false;
}
