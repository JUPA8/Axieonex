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
    <section data-reveal="scale" className="relative bg-ax-ink-0 px-5 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1160px]">
        <h2 className="mb-16 text-center text-[clamp(26px,3.2vw,36px)] font-bold tracking-tight">
          What we automate. What humans own. What you control.
        </h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.label}>
              <div className="mb-3.5 text-xs font-semibold" style={{ color: column.color }}>
                {column.label}
              </div>
              <ul className="m-0 flex list-disc flex-col gap-1 pl-4 text-[14.5px] leading-loose text-ax-text-muted">
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
