import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-accent-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--color-accent)]",
        className
      )}
    >
      {children}
    </span>
  );
}
