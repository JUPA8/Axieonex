export type FaqItem = {
  question: string;
  answer: string;
};

/** Accessible disclosure list. Native <details>/<summary>, no JS required. */
export function FAQ({ items, heading = "Frequently asked questions" }: { items: FaqItem[]; heading?: string }) {
  return (
    <div>
      {heading ? <h2 className="ax-headline-sm mb-10 text-ax-text-primary">{heading}</h2> : null}
      {/* Hairline rules only: no card surfaces, no fills, no shadows. */}
      <div className="flex flex-col divide-y divide-ax-border-subtle border-t border-ax-border-subtle">
        {items.map((item) => (
          <details key={item.question} className="group py-7 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-8 text-[17px] font-normal tracking-[-0.01em] text-ax-text-primary transition-colors marker:content-none hover:text-ax-violet">
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-lg font-extralight text-ax-text-muted transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="ax-lede mt-5 max-w-[62ch] text-[15.5px]">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
