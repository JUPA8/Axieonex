import { TransitionLink } from "@/components/transition/TransitionLink";
import { getRelatedServices } from "@/content/services";

export function RelatedServices({ slug }: { slug: string }) {
  const related = getRelatedServices(slug);
  return (
    <div>
      <div className="mb-5 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">Related services</div>
      <div className="flex flex-wrap gap-3">
        {related.map((service) => (
          <TransitionLink
            key={service.slug}
            href={`/services/${service.slug}`}
            className="min-h-11 rounded-full border border-ax-border-default px-5 py-2.5 text-sm text-ax-text-primary hover:border-ax-text-primary"
          >
            {service.title}
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
