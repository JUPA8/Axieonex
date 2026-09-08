import { BrandMark } from "@/components/brand/BrandMark";
import { HOW_WE_WORK_CONTENT } from "@/content/howWeWork";

export function EngineInteriorHero() {
  return (
    <section className="px-5 pb-16 pt-28 text-center sm:px-10 sm:pt-36">
      <div className="mx-auto max-w-[680px]">
        <div className="mb-6 text-[13px] font-semibold text-ax-cyan-alt">{HOW_WE_WORK_CONTENT.eyebrow}</div>
        <h1 className="mb-6 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
          {HOW_WE_WORK_CONTENT.heading}
        </h1>
        <p className="mx-auto max-w-[52ch] text-base leading-relaxed text-ax-text-muted">{HOW_WE_WORK_CONTENT.body}</p>
        <div className="relative mx-auto mt-12 h-[130px] w-[130px]" aria-hidden="true">
          <svg viewBox="0 0 130 130" className="absolute inset-0 h-full w-full">
            <circle cx={65} cy={65} r={62} fill="none" stroke="rgba(53,211,224,0.25)" strokeWidth={1} />
            <circle
              cx={65}
              cy={65}
              r={52}
              fill="none"
              stroke="#35D3E0"
              strokeWidth={1.5}
              strokeDasharray="6 8"
              className="animate-[ax-spin_3.5s_linear_infinite]"
              style={{ transformOrigin: "65px 65px" }}
            />
          </svg>
          <div className="absolute inset-0 m-auto flex h-[68px] w-[68px] items-center justify-center">
            <BrandMark material="cobalt" size={68} />
          </div>
        </div>
      </div>
    </section>
  );
}
