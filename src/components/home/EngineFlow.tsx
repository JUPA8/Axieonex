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
    <section id="engine" data-reveal="scale" className="ax-section relative">
      <div className="ax-shell">
        <p className="ax-label mb-6">The revenue engine</p>
        <h2 className="ax-headline ax-measure-tight m-0 mb-20 text-ax-text-primary">
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
        <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step) => (
            <div key={step.n} className="border-t border-ax-border-subtle pt-5">
              <div className="mb-3 font-mono text-[11px] tracking-[0.1em]" style={{ color: step.color }}>
                {step.n}
              </div>
              <div className="text-[14px] font-light leading-relaxed text-ax-text-body">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
