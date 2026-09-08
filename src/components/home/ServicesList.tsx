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
    <section id="services" className="relative bg-ax-ink-0 px-5 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1160px]">
        <div data-reveal className="mb-12 flex flex-wrap items-baseline justify-between gap-3.5">
          <h2 className="text-[clamp(28px,3.4vw,38px)] font-bold tracking-tight">One architecture. Seven roles.</h2>
          <TransitionLink href="/services" className="text-sm text-ax-text-muted hover:text-ax-text-primary">
            All services →
          </TransitionLink>
        </div>
        <div data-reveal="mask-left" className="flex flex-col">
          {HOMEPAGE_ORDER.map(({ slug, tagline }, i) => {
            const service = getService(slug);
            if (!service) return null;
            return (
              <TransitionLink
                key={slug}
                href={`/services/${slug}`}
                className={`group flex items-baseline justify-between gap-4 border-t border-white/8 py-5 ${
                  i === HOMEPAGE_ORDER.length - 1 ? "border-b" : ""
                }`}
              >
                <span className="font-display text-xl font-semibold group-hover:text-ax-violet">{service.title}</span>
                <span className="shrink-0 text-[13.5px] text-ax-text-muted">{tagline}</span>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
