"use client";

import { useState } from "react";
import type { FaqItem } from "@/types/content";
import { cn } from "@/lib/cn";

/**
 * Matches the live site's behavior: multiple items can be open at once
 * (confirmed by manually expanding all 8 homepage FAQ items during Phase 0 —
 * none of them collapsed the others).
 */
export function Accordion({ items }: { items: FaqItem[] }) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
      {items.map((item, index) => {
        const isOpen = openSet.has(index);
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-[var(--color-fg)] hover:text-[var(--color-accent)] sm:text-base"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 text-xl text-[var(--color-accent)] transition-transform",
                    isOpen && "rotate-45"
                  )}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-6 pb-6 text-sm leading-relaxed text-[var(--color-fg-muted)]"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
