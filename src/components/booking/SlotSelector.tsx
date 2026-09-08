"use client";

import { useEffect, useState } from "react";
import { buildAvailability } from "@/lib/availability";
import { cn } from "@/lib/cn";
import type { AvailabilityDay } from "@/types/booking";

export function SlotSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string, label: string) => void;
}) {
  const [days, setDays] = useState<AvailabilityDay[] | null>(null);
  const [timezone, setTimezone] = useState("Local time");

  // This route is statically prerendered, so "today" must be computed on the
  // client per-visit rather than baked in at build time (which would freeze
  // "the next 4 weekdays" as of the last deploy for every visitor). Timezone
  // is similarly client/locale-dependent. Both are intentionally deferred to
  // after mount rather than computed during render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(buildAvailability());
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time");
    } catch {
      setTimezone("Local time");
    }
  }, []);

  if (!days) {
    return <p className="text-sm text-ax-text-muted">Loading availability...</p>;
  }

  return (
    <div>
      <p className="mb-5 text-[13.5px] text-ax-text-muted">Your timezone: {timezone}</p>
      <div className="flex flex-col gap-5">
        {days.map((day) => (
          <div key={day.id}>
            <div className="mb-2 text-[13.5px] font-semibold">{day.label}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {day.slots.map((slot) => {
                const isSelected = selectedId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={slot.label}
                    onClick={() => onSelect(slot.id, slot.label)}
                    className={cn(
                      "min-h-11 rounded-md border px-3 py-2.5 text-center text-[13px] transition-colors",
                      isSelected
                        ? "border-ax-cyan-alt bg-ax-cyan-alt/10 text-ax-text-primary"
                        : "border-ax-border-default text-ax-text-primary hover:border-white/30",
                    )}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
