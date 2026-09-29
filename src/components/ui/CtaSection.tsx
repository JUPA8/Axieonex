import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";
import type { BrandMarkMaterial } from "@/components/brand/BrandMark";
import type { FormId } from "@/lib/motion/scene/forms";

export function CtaSection({
  heading,
  body,
  ctaLabel = "Book a strategy call",
  ctaHref = "/book-strategy-call",
  material = "spectral",
  className = "",
  scene,
}: {
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  material?: BrandMarkMaterial;
  className?: string;
  scene?: FormId;
}) {
  return (
    <section data-reveal="scale" data-scene={scene} className={`ax-section relative z-10 ${className}`}>
      <div className="ax-shell flex flex-col items-start">
        <div className="mb-10 opacity-80">
          <BrandMark material={material} size={44} />
        </div>
        <h2 className="ax-headline ax-measure-tight m-0 text-ax-text-primary">{heading}</h2>
        {body ? <p className="ax-lede ax-measure mt-8">{body}</p> : null}
        <div className="mt-12">
          <Button href={ctaHref} variant="primary" size="large" magnetic>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
