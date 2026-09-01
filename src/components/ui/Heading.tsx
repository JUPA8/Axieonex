import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  as: As = "h2",
  children,
  className,
  align = "center",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <As
      className={cn(
        "text-3xl font-bold leading-tight text-[var(--color-fg)] sm:text-4xl",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </As>
  );
}

export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-base leading-relaxed text-[var(--color-fg-muted)]", className)}>
      {children}
    </p>
  );
}
