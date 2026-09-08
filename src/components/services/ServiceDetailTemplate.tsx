import { ServiceHeroVisual } from "@/components/services/ServiceHeroVisual";
import { RelatedServices } from "@/components/services/RelatedServices";
import { CtaSection } from "@/components/ui/CtaSection";
import type { Service } from "@/types/content";

export function ServiceDetailTemplate({ service }: { service: Service }) {
  return (
    <div data-theme={`service-${service.slug}`} className="bg-ax-ink-0 text-ax-text-primary">
      <section className="px-5 pb-12 pt-28 sm:px-10 sm:pt-36">
        <div className="mx-auto grid max-w-[1000px] items-center gap-10 sm:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 text-[13px] font-semibold" style={{ color: service.accent }}>
              {service.role}
            </div>
            <h1 className="mb-5 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">{service.title}</h1>
            <p className="max-w-[56ch] text-base leading-relaxed text-ax-text-muted">{service.purpose}</p>
          </div>
          <ServiceHeroVisual visual={service.visual} accent={service.accent} />
        </div>
      </section>

      <section data-reveal className="border-t border-white/8 px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">The problem it solves</div>
          <p className="text-base leading-relaxed text-ax-text-body">{service.problem}</p>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-14 sm:px-10">
        <div className="mx-auto grid max-w-[1000px] gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: service.accent }}>
              AI performs
            </div>
            <p className="text-sm leading-relaxed text-ax-text-body">{service.ai}</p>
          </div>
          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ax-violet">Humans perform</div>
            <p className="text-sm leading-relaxed text-ax-text-body">{service.human}</p>
          </div>
          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ax-cyan-alt">You control</div>
            <p className="text-sm leading-relaxed text-ax-text-body">{service.control}</p>
          </div>
          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ax-text-primary">You receive</div>
            <p className="text-sm leading-relaxed text-ax-text-body">{service.receive}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-14 sm:px-10">
        <div className="mx-auto grid max-w-[1000px] gap-10 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-bold">Channels and capabilities</h2>
            <p className="text-sm leading-relaxed text-ax-text-body">{service.channels}</p>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold">Quality controls</h2>
            <p className="text-sm leading-relaxed text-ax-text-body">{service.quality}</p>
          </div>
        </div>
      </section>

      <section data-reveal="scale" className="border-t border-white/8 px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-[720px]">
          <h2 className="mb-8 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">How it operates</h2>
          <ol className="flex list-none flex-col gap-6">
            {service.steps.map((step) => (
              <li key={step.n} className="grid grid-cols-[44px_1fr] gap-4">
                <span className="font-display text-lg font-bold" style={{ color: service.accent }}>
                  {step.n}
                </span>
                <span className="text-[15px] leading-relaxed">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-6 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">Frequently asked</div>
          <details className="group border-t border-white/10 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold">
              <span>{service.faqQ}</span>
              <span aria-hidden="true" className="shrink-0 text-xl font-light text-ax-text-muted transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ax-text-body">{service.faqA}</p>
          </details>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-[1000px]">
          <RelatedServices slug={service.slug} />
        </div>
      </section>

      <CtaSection heading="Let's build your revenue engine." material="cobalt" className="bg-ax-ink-1" />
    </div>
  );
}
