const STEPS = [
  { n: "01", color: "#3E7BFA", label: "AI detects signals" },
  { n: "02", color: "#5C86F1", label: "AI prioritizes and orchestrates" },
  { n: "03", color: "#8B5CF6", label: "Human analysts validate" },
  { n: "04", color: "#AA5FCF", label: "Strategists supervise" },
  { n: "05", color: "#CB56B8", label: "Replies qualified" },
  { n: "06", color: "#E94FA8", label: "You join a revenue-ready call" },
];

export function EngineFlow() {
  return (
    <section id="engine" data-reveal="scale" className="relative bg-ax-ink-1 px-5 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-3.5 text-center text-[13px] font-semibold text-ax-cyan">The revenue engine</div>
        <h2 className="mb-16 text-center text-[clamp(28px,3.6vw,40px)] font-bold tracking-tight">
          Signal in. Revenue conversation out.
        </h2>
        <svg viewBox="0 0 1100 160" className="block w-full overflow-visible" style={{ height: "auto" }} aria-hidden="true">
          <defs>
            <linearGradient id="ax-eng-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3E7BFA" />
              <stop offset="0.5" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#E94FA8" />
            </linearGradient>
          </defs>
          <path
            d="M40,80 C160,20 260,140 380,80 C480,30 560,130 660,80 C760,30 840,130 940,80 C990,60 1030,90 1060,80"
            fill="none"
            stroke="url(#ax-eng-grad)"
            strokeWidth={2}
          />
        </svg>
        <div className="mt-6 flex flex-wrap justify-between gap-3.5">
          {STEPS.map((step) => (
            <div key={step.n} className="min-w-[140px] flex-1 text-center">
              <div className="mb-2 text-[11px] font-semibold" style={{ color: step.color }}>
                {step.n}
              </div>
              <div className="text-sm font-semibold">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
