import { Button } from "@/components/ui/Button";
import type { Service } from "@/types/content";

export function ServiceModulePanel({ service }: { service: Service }) {
  return (
    <div aria-live="polite" className="rounded-lg border border-white/8 bg-white/[0.02] p-8 sm:p-10">
      <div className="mb-3 text-[11px] font-semibold tracking-wide text-ax-text-muted">{service.ecosystem.tag}</div>
      <h2 className="mb-3 font-display text-2xl font-bold">{service.title}</h2>
      <p className="mb-8 max-w-[60ch] text-[15px] leading-relaxed text-ax-text-muted">{service.ecosystem.purpose}</p>
      <div className="mb-9 grid gap-6 sm:grid-cols-3">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: service.accent }}>
            AI performs
          </div>
          <p className="text-sm leading-relaxed text-ax-text-body">{service.ecosystem.aiPerforms}</p>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ax-violet">Humans perform</div>
          <p className="text-sm leading-relaxed text-ax-text-body">{service.ecosystem.humansPerform}</p>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ax-cyan-alt">You receive</div>
          <p className="text-sm leading-relaxed text-ax-text-body">{service.ecosystem.youReceive}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button href={`/services/${service.slug}`} variant="secondary">
          View full service page
        </Button>
        <Button href="/book-strategy-call" variant="primary">
          Discuss this service
        </Button>
      </div>
    </div>
  );
}
