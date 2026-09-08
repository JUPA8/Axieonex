import { BrandMark } from "@/components/brand/BrandMark";

export function AssemblyHero() {
  return (
    <section className="px-5 pb-16 pt-28 text-center sm:px-10 sm:pt-36">
      <div className="mx-auto max-w-[700px]">
        <div className="mb-6 text-[13px] font-semibold text-ax-platinum">Engagement, not a price list</div>
        <h1 className="mb-6 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
          Structured to your market, calibrated to your goals.
        </h1>
        <p className="mx-auto max-w-[58ch] text-base leading-relaxed text-ax-text-muted">
          Every engagement is built around your target market, channels and required human involvement. Below is the
          framework we use to scope it, not a fixed menu.
        </p>
        <div className="relative mx-auto mt-12 h-[130px] w-[130px]" aria-hidden="true">
          <svg viewBox="0 0 130 130" className="absolute inset-0 h-full w-full">
            <circle
              cx={65}
              cy={65}
              r={60}
              fill="none"
              stroke="rgba(139,92,246,0.35)"
              strokeWidth={1}
              className="animate-[ax-pulse_2.8s_ease-in-out_infinite]"
            />
            <circle
              cx={65}
              cy={65}
              r={50}
              fill="none"
              stroke="rgba(183,156,239,0.25)"
              strokeWidth={1}
              className="animate-[ax-pulse_2.8s_ease-in-out_infinite]"
              style={{ animationDelay: "0.6s" }}
            />
          </svg>
          <div className="absolute inset-0 m-auto flex h-[68px] w-[68px] items-center justify-center">
            <BrandMark material="platinum" size={68} />
          </div>
        </div>
      </div>
    </section>
  );
}
