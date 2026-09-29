import { BrandMark } from "@/components/brand/BrandMark";
import { AmbientField } from "@/components/motion/AmbientField";
import { HOW_WE_WORK_CONTENT } from "@/content/howWeWork";

export function EngineInteriorHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Operational choreography: coordinated pathways running behind the
          statement rather than a decorative badge beneath it. */}
      <AmbientField className="opacity-65" intensity={0.46} markScale={0.44} />
      <div className="ax-shell relative z-10 grid items-center gap-x-16 gap-y-12 pb-[clamp(56px,8vw,110px)] pt-[clamp(120px,16vh,200px)] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="ax-label mb-7">{HOW_WE_WORK_CONTENT.eyebrow}</p>
          <h1 className="ax-headline m-0 text-ax-text-primary">{HOW_WE_WORK_CONTENT.heading}</h1>
          <p className="ax-lede ax-measure mt-9">{HOW_WE_WORK_CONTENT.body}</p>
        </div>
        <div className="relative flex justify-center lg:justify-end" aria-hidden="true">
          <div className="relative h-[150px] w-[150px]">
            <svg viewBox="0 0 150 150" className="absolute inset-0 h-full w-full">
              <circle cx={75} cy={75} r={72} fill="none" stroke="rgba(139,92,246,0.18)" strokeWidth={1} />
              <circle
                cx={75}
                cy={75}
                r={60}
                fill="none"
                stroke="rgba(139,92,246,0.55)"
                strokeWidth={1}
                strokeDasharray="5 10"
                className="animate-[ax-spin_9s_linear_infinite] motion-reduce:animate-none"
                style={{ transformOrigin: "75px 75px" }}
              />
            </svg>
            <div className="absolute inset-0 m-auto flex h-[76px] w-[76px] items-center justify-center">
              <BrandMark material="spectral" size={76} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
