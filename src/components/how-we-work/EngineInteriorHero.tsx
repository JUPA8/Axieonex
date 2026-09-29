import { HOW_WE_WORK_CONTENT } from "@/content/howWeWork";

/**
 * How We Work opens on the orchestration state of the environment: coordinated
 * pathways sweeping the full viewport behind the statement. There is no small
 * badge beside the copy any more, because the composition is the page.
 */
export function EngineInteriorHero() {
  return (
    <section data-scene="lanes" className="relative z-10 flex min-h-screen items-center">
      <div className="ax-shell w-full pt-[clamp(96px,12vh,160px)]">
        <p className="ax-label mb-7">{HOW_WE_WORK_CONTENT.eyebrow}</p>
        <div className="max-w-[20ch]">
          <h1 className="ax-display ax-hero-display m-0 text-ax-text-primary">{HOW_WE_WORK_CONTENT.heading}</h1>
        </div>
        <p className="ax-lede ax-measure mt-8">{HOW_WE_WORK_CONTENT.body}</p>
      </div>
    </section>
  );
}
