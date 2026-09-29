const COLUMNS = [
  {
    label: "Axieonex automates",
    color: "#3E7BFA",
    items: ["Signal detection and scoring", "List building and enrichment", "Sequencing and cadence", "Reporting and visibility"],
  },
  {
    label: "Humans own",
    color: "#8B5CF6",
    items: ["Lead validation and quality bar", "Tone, timing and nuance", "Reply handling and objections", "Qualification judgment"],
  },
  {
    label: "You control",
    color: "#E94FA8",
    items: ["Brand voice and positioning", "ICP definition and boundaries", "Your definition of qualified", "The final sales conversation"],
  },
];

export function ResponsibilitySplit() {
  return (
    <section data-reveal="scale" data-scene="validate" className="ax-section relative z-10">
      <div className="ax-shell">
        <p className="ax-label mb-6">Division of labour</p>
        <h2 className="ax-headline ax-measure m-0 mb-20 text-ax-text-primary">
          What we automate. What humans own. What you control.
        </h2>
        <div className="grid gap-x-12 gap-y-14 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.label} className="border-t border-ax-border-subtle pt-7">
              <div
                className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: column.color }}
              >
                {column.label}
              </div>
              <ul className="m-0 flex list-none flex-col gap-4 p-0 text-[15px] font-light leading-relaxed text-ax-text-body">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
