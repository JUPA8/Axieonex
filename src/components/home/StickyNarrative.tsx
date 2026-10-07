"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FormId } from "@/lib/motion/scene/forms";
import { SCENES_CHANGED_EVENT } from "@/lib/motion/scene/sceneEngine";
import { useHydrated } from "@/lib/useHydrated";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Beat = {
  n: string;
  title: string;
  body: string;
  /** The line that stays on the rail as context once the beat has passed. */
  residue: string;
};

const BEATS: Beat[] = [
  {
    n: "01",
    title: "Detection",
    residue: "Intent isolated from noise",
    body: "The market is noisy. Our AI continuously scans thousands of accounts, filtering out weak activity and isolating genuine buying intent: funding, hiring, technology-stack changes.",
  },
  {
    n: "02",
    title: "Orchestration",
    residue: "Channels moving in sequence",
    body: "Validated signals enter one coordinated system: data, messaging, email, LinkedIn and calling moving in sequence, with strategists supervising tone, timing and cadence throughout.",
  },
  {
    n: "03",
    title: "Qualified conversation",
    residue: "One opportunity, ready to sell",
    body: "The coordinated paths resolve into one opportunity. A human has validated it, managed the reply, and handled the objections. You step in ready to sell.",
  },
];

/**
 * Environment states laid across the pinned run, as fractions of the pin's
 * scroll distance. The first three align with the three copy beats; the last
 * two carry the third beat past validation into the AXIEONEX X and then the
 * qualified-opportunity core, so the sequence resolves rather than just
 * stopping on the form it arrived with.
 */
const SCENES: { scene: FormId; start: number; end: number }[] = [
  { scene: "scan", start: 0, end: 0.32 },
  { scene: "lanes", start: 0.32, end: 0.62 },
  { scene: "validate", start: 0.62, end: 0.78 },
  { scene: "mark", start: 0.78, end: 0.92 },
  { scene: "core", start: 0.92, end: 1 },
];

/** Pin progress at which each beat's copy takes over. */
const BEAT_STARTS = [0, 0.32, 0.62];

const DESKTOP_TRACK_VH = 360;
/** Phones get a shorter run: the same three beats, less thumb distance. */
const MOBILE_TRACK_VH = 250;
const MOBILE_MAX_WIDTH = 820;

function subscribeViewport(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function readTrackVh() {
  return window.innerWidth <= MOBILE_MAX_WIDTH ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;
}

function serverTrackVh() {
  return DESKTOP_TRACK_VH;
}

export function StickyNarrative() {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const trackVh = useSyncExternalStore(subscribeViewport, readTrackVh, serverTrackVh);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  // The pinned layout only exists after hydration, so the server render and
  // the first client render agree on the static one.
  const pinned = hydrated && !reduced;

  // Swapping layouts changes which `[data-scene]` elements exist, and resizing
  // moves them, so the backdrop has to re-read the DOM.
  useEffect(() => {
    window.dispatchEvent(new Event(SCENES_CHANGED_EVENT));
  }, [pinned, trackVh]);

  useEffect(() => {
    if (!pinned) return;
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      // 0 when the stage pins, 1 when it releases.
      const span = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / span));
      let next = 0;
      for (let i = BEAT_STARTS.length - 1; i >= 0; i -= 1) {
        if (progress >= BEAT_STARTS[i]) {
          next = i;
          break;
        }
      }
      // React only ever hears about the three discrete beats, never the scroll
      // position, so nothing re-renders per frame.
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinned, trackVh]);

  /**
   * Before JavaScript is ready, and whenever reduced motion is requested, the
   * sequence is three ordinary full-height sections: every stage readable, no
   * scroll binding, no hidden copy, no pin.
   */
  if (!pinned) {
    return (
      <ol
        aria-label="How the engine works"
        data-sticky-narrative="static"
        className="m-0 flex list-none flex-col p-0"
      >
        {BEATS.map((beat, i) => (
          <li key={beat.n} data-scene={SCENES[i].scene} className="relative z-10 flex min-h-screen items-center">
            <div className="ax-shell w-full">
              <div className="max-w-[34ch]">
                <div aria-hidden="true" className="mb-8 font-mono text-[12px] tracking-[0.14em] text-ax-violet">
                  {beat.n}
                </div>
                <h2 className="ax-headline m-0 text-ax-text-primary">{beat.title}</h2>
                <p className="ax-lede ax-veil mt-8 max-w-[46ch]">{beat.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  // The engine reads a stage as "current" from the moment its top crosses the
  // viewport midpoint, so each marker is offset half a viewport down the track
  // and scaled to the pin distance. That makes marker n hold its form exactly
  // while beat n is on screen.
  const pin = trackVh - 100;

  return (
    <section
      ref={trackRef}
      data-sticky-narrative="pinned"
      aria-label="How the engine works"
      className="relative z-10"
      style={{ height: `${trackVh}vh` }}
    >
      {SCENES.map((range) => (
        <div
          key={range.scene}
          aria-hidden="true"
          data-scene={range.scene}
          className="pointer-events-none absolute inset-x-0"
          style={{ top: `${50 + range.start * pin}vh`, height: `${(range.end - range.start) * pin}vh` }}
        />
      ))}

      {/* The full sequence stays in the accessibility tree in document order,
          so a screen reader gets all three stages without scrolling them. */}
      <ol className="sr-only">
        {BEATS.map((beat) => (
          <li key={beat.n}>
            <h2>{beat.title}</h2>
            <p>{beat.body}</p>
          </li>
        ))}
      </ol>

      <div aria-hidden="true" className="ax-pin-sticky sticky top-0 h-screen overflow-hidden">
        <div className="ax-shell w-full">
          {/* Every stage stays on the rail: passed ones keep their outcome
              visible as context, so the sequence reads as one running system
              rather than three slides. */}
          <ol className="ax-pin-rail ax-veil m-0 mb-9 flex w-fit list-none flex-col gap-2.5 p-0 sm:mb-12">
            {BEATS.map((beat, i) => (
              <li key={beat.n} data-state={i === active ? "current" : i < active ? "past" : "ahead"}>
                <span className="ax-pin-rail-n">{beat.n}</span>
                <span className="ax-pin-rail-bar" />
                <span className="ax-pin-rail-label">{i < active ? beat.residue : beat.title}</span>
              </li>
            ))}
          </ol>

          <div className="ax-pin-stage">
            {BEATS.map((beat, i) => (
              <div key={beat.n} className="ax-pin-beat" data-state={i === active ? "current" : "off"}>
                <h2 className="ax-headline m-0 max-w-[20ch] text-ax-text-primary">{beat.title}</h2>
                <p className="ax-lede ax-veil mt-7 max-w-[46ch]">{beat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
