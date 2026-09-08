"use client";

import { useState } from "react";
import { PRICING_DISCLAIMER, PRICING_TIERS } from "@/content/pricing";
import { cn } from "@/lib/cn";

export function EngagementConfigurator() {
  const [selected, setSelected] = useState(1);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRICING_TIERS.map((tier, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={tier.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(i)}
              className={cn(
                "flex min-h-11 flex-col rounded-lg border p-6 text-left transition-colors duration-300",
                isSelected ? "border-ax-violet bg-white/[0.04]" : "border-white/10 bg-white/[0.02] hover:border-white/20",
              )}
            >
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">{tier.name}</div>
              <div className="mb-4 font-display text-2xl font-bold">{tier.price}</div>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-ax-text-body">{tier.description}</p>
              <span
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-sm px-4 text-sm font-semibold",
                  isSelected ? "bg-ax-violet text-white" : "border border-white/15 text-ax-text-primary",
                )}
              >
                View details
              </span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {PRICING_TIERS[selected].name} selected
      </p>
      <p className="mt-6 text-[13px] text-ax-text-muted">{PRICING_DISCLAIMER}</p>
    </div>
  );
}
