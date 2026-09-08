"use client";

import { SERVICES } from "@/content/services";
import { cn } from "@/lib/cn";

export function ServiceEcosystemDiagram({ active, onSelect }: { active: string; onSelect: (slug: string) => void }) {
  const core = { x: 350, y: 250 };
  return (
    <div className="relative mx-auto aspect-[7/5] w-full max-w-[700px]">
      <svg viewBox="0 0 700 500" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {SERVICES.map((service) => (
          <line
            key={service.slug}
            x1={core.x}
            y1={core.y}
            x2={service.ecosystem.x}
            y2={service.ecosystem.y}
            stroke={service.accent}
            strokeWidth={1}
            opacity={active === service.slug ? 0.55 : 0.2}
            className="transition-opacity duration-300"
          />
        ))}
        <circle cx={core.x} cy={core.y} r={34} fill="#0B1730" stroke="#35D3E0" strokeWidth={2} />
        <text x={core.x} y={core.y + 4} textAnchor="middle" fill="#5CC8E8" fontSize={11} fontFamily="var(--ax-font-mono)" letterSpacing="0.06em">
          CORE
        </text>
      </svg>
      {SERVICES.map((service) => {
        const isActive = active === service.slug;
        const leftPct = (service.ecosystem.x / 700) * 100;
        const topPct = (service.ecosystem.y / 500) * 100;
        return (
          <button
            key={service.slug}
            type="button"
            onClick={() => onSelect(service.slug)}
            onFocus={() => onSelect(service.slug)}
            aria-pressed={isActive}
            aria-label={service.title}
            className={cn(
              "absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-[#0B1730] text-[11px] font-semibold transition-transform duration-300",
              isActive ? "scale-110" : "scale-100",
            )}
            style={{ left: `${leftPct}%`, top: `${topPct}%`, borderColor: service.accent, minWidth: 44, minHeight: 44 }}
          >
            <span className="sr-only">{service.title}</span>
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: service.accent }} />
          </button>
        );
      })}
      {SERVICES.map((service) => {
        const leftPct = (service.ecosystem.x / 700) * 100;
        const topPct = (service.ecosystem.y / 500) * 100;
        const side = service.ecosystem.labelSide;
        return (
          <div
            key={`${service.slug}-label`}
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-[11px] text-ax-text-muted"
            style={{
              left: `${leftPct}%`,
              top: side === "above" ? `calc(${topPct}% - 34px)` : side === "below" ? `calc(${topPct}% + 26px)` : `${topPct}%`,
              transform: side === "left" ? "translate(-115%, -50%)" : side === "right" ? "translate(15%, -50%)" : "translateX(-50%)",
            }}
          >
            {service.ecosystem.label}
          </div>
        );
      })}
    </div>
  );
}
