import type { FormId } from "@/lib/motion/scene/forms";

const STAGES: { n: string; title: string; body: string; scene: FormId }[] = [
  {
    n: "01",
    title: "Detection",
    scene: "scan",
    body: "The market is noisy. Our AI continuously scans thousands of accounts, filtering out weak activity and isolating genuine buying intent: funding, hiring, technology-stack changes.",
  },
  {
    n: "02",
    title: "Orchestration",
    scene: "lanes",
    body: "Validated signals enter one coordinated system: data, messaging, email, LinkedIn and calling moving in sequence, with strategists supervising tone, timing and cadence throughout.",
  },
  {
    n: "03",
    title: "Qualified conversation",
    scene: "validate",
    body: "The coordinated paths resolve into one opportunity. A human has validated it, managed the reply, and handled the objections. You step in ready to sell.",
  },
];

/**
 * Three full-viewport chapters. Each one holds the shared environment in a
 * different form, so the same living system visibly transforms from noise, to
 * coordinated pathways, to a reviewed opportunity as the visitor scrolls.
 */
export function EngineDiagram() {
  return (
    <>
      {STAGES.map((stage) => (
        <section
          key={stage.n}
          data-scene={stage.scene}
          className="relative z-10 flex min-h-screen items-center"
        >
          <div className="ax-shell w-full">
            <div className="max-w-[34ch]">
              <div aria-hidden="true" className="mb-8 font-mono text-[12px] tracking-[0.14em] text-ax-violet">
                {stage.n}
              </div>
              <h2 className="ax-headline m-0 text-ax-text-primary">{stage.title}</h2>
              <p className="ax-lede mt-8 max-w-[46ch]">{stage.body}</p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
