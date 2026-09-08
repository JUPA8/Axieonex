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
    <section className="relative bg-ax-ink-1 px-5 py-24 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-[820px]">
        <div data-reveal className="mb-4 text-[13px] font-semibold text-ax-cyan">
          How engagement works
        </div>
        <div data-reveal="scale" className="flex flex-col">
          {STEPS.map((step, i) => {
            const last = i === STEPS.length - 1;
            return (
              <div
                key={step}
                className={`grid grid-cols-[56px_1fr] gap-5 border-t border-white/8 py-4.5 ${last ? "border-b" : ""}`}
              >
                <span
                  className="font-display text-lg font-bold"
                  style={
                    last
                      ? {
                          backgroundImage: "var(--ax-gradient-cyan-blue)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }
                      : { color: "#4A4F66" }
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={last ? "text-base font-semibold" : "text-base"}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
