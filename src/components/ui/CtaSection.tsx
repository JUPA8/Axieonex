import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";
import type { BrandMarkMaterial } from "@/components/brand/BrandMark";

export function CtaSection({
  heading,
  body,
  ctaLabel = "Book a strategy call",
  ctaHref = "/book-strategy-call",
  material = "spectral",
  className = "",
}: {
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  material?: BrandMarkMaterial;
  className?: string;
}) {
  return (
    <section data-reveal="scale" className={`relative px-5 py-24 text-center sm:px-10 sm:py-36 ${className}`}>
      <div className="mx-auto flex max-w-[720px] flex-col items-center">
        <div className="mb-7 h-16 w-16">
          <BrandMark material={material} size={64} />
        </div>
        <h2 className="mb-4 text-[length:var(--ax-fs-h1-fluid)] font-bold tracking-tight">{heading}</h2>
        <p className="mb-9 max-w-[52ch] text-[16.5px] leading-relaxed text-ax-text-muted">{body}</p>
        <Button href={ctaHref} variant="primary" size="large" magnetic>
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
