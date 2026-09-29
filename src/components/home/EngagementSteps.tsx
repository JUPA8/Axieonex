const STEPS = [
  "Understand your business and ideal customer",
  "Build the signal and targeting system",
  "Design the outreach architecture",
  "Launch coordinated execution",
  "Manage and qualify responses",
  "Improve using real market feedback",
  "Deliver revenue-ready conversations",
];

export function EngagementSteps() {
  return (
    <section className="ax-section relative">
      <div className="ax-shell grid gap-x-16 gap-y-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div data-reveal>
          <p className="ax-label mb-6">How engagement works</p>
          <h2 className="ax-headline-sm m-0 text-ax-text-primary">Seven steps, one accountable system.</h2>
        </div>
        <div data-reveal="scale" className="flex flex-col border-t border-ax-border-subtle">
          {STEPS.map((step, i) => {
            const last = i === STEPS.length - 1;
            return (
              <div key={step} className="grid grid-cols-[52px_1fr] gap-6 border-b border-ax-border-subtle py-5">
                <span
                  aria-hidden="true"
                  className={`font-mono text-[12px] tracking-[0.08em] ${last ? "text-ax-violet" : "text-ax-text-muted"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-[16px] leading-relaxed ${last ? "font-normal text-ax-text-primary" : "font-light text-ax-text-body"}`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
