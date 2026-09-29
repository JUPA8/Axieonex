import { Button } from "@/components/ui/Button";
import type { Service } from "@/types/content";

export function ServiceModulePanel({ service }: { service: Service }) {
  return (
    // Hairline rule instead of a panel: the module detail floats on the void
    // like the rest of the page.
    <div aria-live="polite" className="border-t border-ax-border-subtle pt-10">
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-text-muted">
        {service.ecosystem.tag}
      </div>
      <h2 className="ax-headline-sm m-0 mb-6 text-ax-text-primary">{service.title}</h2>
      <p className="ax-lede mb-12 max-w-[58ch] text-[15.5px]">{service.ecosystem.purpose}</p>
      <div className="mb-12 grid gap-x-8 gap-y-8 sm:grid-cols-3">
        <div>
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: service.accent }}>
            AI performs
          </div>
          <p className="text-[14px] font-light leading-relaxed text-ax-text-body">{service.ecosystem.aiPerforms}</p>
        </div>
        <div>
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-violet">
            Humans perform
          </div>
          <p className="text-[14px] font-light leading-relaxed text-ax-text-body">{service.ecosystem.humansPerform}</p>
        </div>
        <div>
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-warning">You receive</div>
          <p className="text-[14px] font-light leading-relaxed text-ax-text-body">{service.ecosystem.youReceive}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <Button href="/book-strategy-call" variant="primary">
          Discuss this service
        </Button>
        <Button href={`/services/${service.slug}`} variant="ghost">
          View full service page
        </Button>
      </div>
    </div>
  );
}
