import { TransitionLink } from "@/components/transition/TransitionLink";
import { getService } from "@/content/services";

const HOMEPAGE_ORDER: { slug: string; tagline: string }[] = [
  { slug: "lead-generation", tagline: "Signal-driven sourcing" },
  { slug: "cold-email", tagline: "Supervised sequences" },
  { slug: "linkedin-outreach", tagline: "Coordinated social engagement" },
  { slug: "cold-calling", tagline: "Warm signal, not cold lists" },
  { slug: "appointment-setting", tagline: "Meetings, only once qualified" },
  { slug: "hybrid-sdr", tagline: "The full engine, end to end" },
  { slug: "presales-gtm", tagline: "Targeting and offer design" },
];

export function ServicesList() {
  return (
    <section id="services" data-scene="lanes" className="ax-section relative z-10">
      <div className="ax-shell ax-veil">
        <div data-reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="ax-label mb-6">Services</p>
            <h2 className="ax-headline m-0 text-ax-text-primary">One architecture. Seven roles.</h2>
          </div>
          <TransitionLink
            href="/services"
            className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ax-text-muted transition-colors hover:text-ax-text-primary"
          >
            All services
          </TransitionLink>
        </div>
        <div data-reveal="mask-left" className="flex flex-col border-t border-ax-border-subtle">
          {HOMEPAGE_ORDER.map(({ slug, tagline }) => {
            const service = getService(slug);
            if (!service) return null;
            return (
              <TransitionLink
                key={slug}
                href={`/services/${slug}`}
                className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-ax-border-subtle py-7 transition-colors"
              >
                <span className="font-display text-[clamp(22px,2.4vw,32px)] font-normal tracking-[-0.03em] text-ax-text-primary transition-colors group-hover:text-ax-violet">
                  {service.title}
                </span>
                <span className="shrink-0 text-[13px] font-light text-ax-text-muted">{tagline}</span>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
