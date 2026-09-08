export type FaqItem = {
  question: string;
  answer: string;
};

/** Accessible disclosure list. Native <details>/<summary> — no JS required. */
export function FAQ({ items, heading = "Frequently asked questions" }: { items: FaqItem[]; heading?: string }) {
  return (
    <div>
      {heading ? <h2 className="mb-8 text-[length:var(--ax-fs-h2-fluid)] font-bold">{heading}</h2> : null}
      <dl className="flex flex-col divide-y divide-ax-border-subtle border-y border-ax-border-subtle">
        {items.map((item) => (
          <details key={item.question} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-ax-text-primary marker:content-none">
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl font-light text-ax-text-muted transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <dd className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ax-text-body">{item.answer}</dd>
          </details>
        ))}
      </dl>
    </div>
  );
}
