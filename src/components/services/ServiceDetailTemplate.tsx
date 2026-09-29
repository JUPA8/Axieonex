import { ServiceHeroVisual } from "@/components/services/ServiceHeroVisual";
import { RelatedServices } from "@/components/services/RelatedServices";
import { CtaSection } from "@/components/ui/CtaSection";
import type { Service } from "@/types/content";

export function ServiceDetailTemplate({ service }: { service: Service }) {
  return (
    <div data-theme={`service-${service.slug}`}>
      <section className="pb-[clamp(48px,7vw,96px)] pt-[clamp(120px,15vh,180px)]">
        <div className="ax-shell grid items-center gap-x-16 gap-y-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-7 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: service.accent }}>
              {service.role}
            </div>
            <h1 className="ax-headline m-0 mb-8 text-ax-text-primary">{service.title}</h1>
            <p className="ax-lede ax-measure">{service.purpose}</p>
          </div>
          <ServiceHeroVisual visual={service.visual} accent={service.accent} />
        </div>
      </section>

      <section data-reveal className="ax-section-tight">
        <div className="ax-shell max-w-[860px]">
          <div className="ax-label mb-6">The problem it solves</div>
          <p className="ax-lede">{service.problem}</p>
        </div>
      </section>

      <section className="ax-section-tight">
        <div className="ax-shell grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: service.accent }}>
              AI performs
            </div>
            <p className="ax-lede text-[15px]">{service.ai}</p>
          </div>
          <div>
            <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-violet">Humans perform</div>
            <p className="ax-lede text-[15px]">{service.human}</p>
          </div>
          <div>
            <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-cyan-alt">You control</div>
            <p className="ax-lede text-[15px]">{service.control}</p>
          </div>
          <div>
            <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-text-primary">You receive</div>
            <p className="ax-lede text-[15px]">{service.receive}</p>
          </div>
        </div>
      </section>

      <section className="ax-section-tight">
        <div className="ax-shell grid gap-x-16 gap-y-12 sm:grid-cols-2">
          <div>
            <h2 className="ax-headline-sm mb-5 text-ax-text-primary">Channels and capabilities</h2>
            <p className="ax-lede text-[15px]">{service.channels}</p>
          </div>
          <div>
            <h2 className="ax-headline-sm mb-5 text-ax-text-primary">Quality controls</h2>
            <p className="ax-lede text-[15px]">{service.quality}</p>
          </div>
        </div>
      </section>

      <section data-reveal="scale" className="ax-section-tight">
        <div className="ax-shell max-w-[860px]">
          <h2 className="ax-label mb-10">How it operates</h2>
          <ol className="flex list-none flex-col gap-6">
            {service.steps.map((step) => (
              <li key={step.n} className="grid grid-cols-[48px_1fr] gap-6 border-b border-ax-border-subtle pb-6">
                <span className="font-mono text-[12px] tracking-[0.1em]" style={{ color: service.accent }}>
                  {step.n}
                </span>
                <span className="text-[15px] font-light leading-relaxed text-ax-text-body">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ax-section-tight">
        <div className="ax-shell max-w-[860px]">
          <div className="ax-label mb-8">Frequently asked</div>
          <details className="group border-t border-ax-border-subtle py-7">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-8 text-[17px] font-normal tracking-[-0.01em] text-ax-text-primary transition-colors hover:text-ax-violet">
              <span>{service.faqQ}</span>
              <span aria-hidden="true" className="shrink-0 text-xl font-light text-ax-text-muted transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="ax-lede mt-5 max-w-[62ch] text-[15.5px]">{service.faqA}</p>
          </details>
        </div>
      </section>

      <section className="ax-section-tight">
        <div className="ax-shell">
          <RelatedServices slug={service.slug} />
        </div>
      </section>

      <CtaSection heading="Let's build your revenue engine." />
    </div>
  );
}
