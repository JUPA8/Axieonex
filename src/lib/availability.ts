import type { AvailabilityDay } from "@/types/booking";

const SLOT_TIMES = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"];
const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Hardcoded mock availability (next 4 weekdays x 4 fixed slots), matching the
 * approved static prototype exactly. Production requires a real calendar
 * provider query, see axieonex-integrations.json.
 */
export function buildAvailability(referenceDate = new Date()): AvailabilityDay[] {
  const days: AvailabilityDay[] = [];
  const cursor = new Date(referenceDate);
  cursor.setDate(cursor.getDate() + 1);

  while (days.length < 4) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const isoDate = cursor.toISOString().slice(0, 10);
      days.push({
        id: isoDate,
        label: `${WEEKDAY_LABELS[day]}, ${MONTH_LABELS[cursor.getMonth()]} ${cursor.getDate()}`,
        slots: SLOT_TIMES.map((time) => ({
          id: `${isoDate}_${time}`,
          time,
          label: `${WEEKDAY_LABELS[day]}, ${MONTH_LABELS[cursor.getMonth()]} ${cursor.getDate()} at ${time}`,
        })),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
