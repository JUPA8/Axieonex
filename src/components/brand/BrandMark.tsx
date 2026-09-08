import { useId } from "react";

export type BrandMarkMaterial = "spectral" | "pearl" | "graphite" | "cobalt" | "platinum" | "monochrome";

const MATERIALS: Record<BrandMarkMaterial, [string, string, string]> = {
  // [gradientA start, gradientA end/gradientB start, gradientB end]
  spectral: ["#4C82FF", "#8B5CF6", "#EA4FA0"],
  pearl: ["#C9CBD6", "#9A9EAE", "#E4E1D8"],
  graphite: ["#5B6070", "#2A2D36", "#8E92A0"],
  cobalt: ["#5CC8E8", "#3E7BFA", "#4C82FF"],
  platinum: ["#B7B7C4", "#8E92A0", "#EAEEF6"],
  monochrome: ["#EAEEF6", "#C4C8D4", "#8E92A0"],
};

export type BrandMarkProps = {
  material?: BrandMarkMaterial;
  size?: number;
  className?: string;
  /** Set when the mark is the sole logo link (adds an accessible name); otherwise decorative. */
  title?: string;
};

/**
 * The canonical AXIEONEX X geometry (two intersecting gradient strokes), ported
 * from LogoMark.dc.html. Used in the header, footer, hero compositions, and the
 * persistent transition overlay mark.
 */
export function BrandMark({ material = "spectral", size = 24, className, title }: BrandMarkProps) {
  const uid = useId().replace(/[:]/g, "");
  const [start, mid, end] = MATERIALS[material];
  const idA = `axLogoA-${uid}`;
  const idB = `axLogoB-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={idA} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={start} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <linearGradient id={idB} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
      </defs>
      <path fill={`url(#${idA})`} d="M6,10 Q26,6 34,26 Q42,46 58,54 Q40,50 30,38 Q20,26 6,10 Z" />
      <path fill={`url(#${idB})`} d="M58,10 Q38,6 30,26 Q22,46 6,54 Q24,50 34,38 Q44,26 58,10 Z" />
    </svg>
  );
}
