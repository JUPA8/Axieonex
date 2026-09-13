import type { AvailabilityDay } from "@/types/booking";

/**
 * Cal.com API v2 integration (https://cal.com/docs/api-reference/v2/introduction).
 *
 * Why Cal.com over Google Calendar: it's purpose-built for exactly this
 * problem (a booking page backed by availability + confirmed appointments),
 * so it owns slot-conflict logic, buffers, and confirmation emails itself.
 * A raw Google Calendar integration would require building all of that by
 * hand on top of a general-purpose calendar API. Cal.com also authenticates
 * with a single API key per account rather than a per-user OAuth consent
 * flow, which fits a single-business booking page (not a multi-tenant
 * scheduling product) much better.
 *
 * CALENDAR_PROVIDER_API_KEY maps to a Cal.com API key (Settings > Developer
 * > API Keys). CALENDAR_ID maps to the numeric Event Type ID for the
 * "Strategy Call" event type (visible in that event type's URL/settings in
 * the Cal.com dashboard).
 *
 * IMPORTANT: this is implemented against Cal.com's documented v2 request/
 * response shapes, but has not been exercised against a live Cal.com
 * account (none was available to test with), no credentials were invented
 * to work around that. Verify the exact response shape against a real
 * sandbox account before relying on this in production; the response
 * parsing below is deliberately defensive (falls back to "unavailable"
 * rather than throwing) for exactly that reason.
 */

const CALCOM_API_BASE = "https://api.cal.com/v2";
const SLOT_WINDOW_DAYS = 10;
const MAX_DAYS = 4;
const MAX_SLOTS_PER_DAY = 4;

function isConfigured(): boolean {
  return Boolean(process.env.CALENDAR_PROVIDER_API_KEY && process.env.CALENDAR_ID);
}

type CalcomSlotsResponse = {
  status?: string;
  data?: Record<string, Array<{ start: string; time?: string }>>;
};

/**
 * Fetches real availability from Cal.com, grouped into the same
 * AvailabilityDay[] shape the mocked generator produces, so SlotSelector
 * doesn't need to know which source it's rendering. Returns null (not an
 * empty array) when unconfigured or on any failure, so the caller can
 * distinguish "no provider" / "provider errored" from "provider says no
 * slots are open."
 */
export async function getCalcomAvailability(): Promise<AvailabilityDay[] | null> {
  if (!isConfigured()) return null;

  const apiKey = process.env.CALENDAR_PROVIDER_API_KEY;
  const eventTypeId = process.env.CALENDAR_ID;
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + SLOT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  try {
    const url = new URL(`${CALCOM_API_BASE}/slots`);
    url.searchParams.set("eventTypeId", eventTypeId!);
    url.searchParams.set("start", startTime.toISOString());
    url.searchParams.set("end", endTime.toISOString());

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": "2024-09-04",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[calcom] Slots request failed with status ${response.status}`);
      return null;
    }

    const body = (await response.json()) as CalcomSlotsResponse;
    const byDate = body.data;
    if (!byDate || typeof byDate !== "object") {
      console.error("[calcom] Unexpected slots response shape:", body);
      return null;
    }

    const days: AvailabilityDay[] = Object.entries(byDate)
      .slice(0, MAX_DAYS)
      .map(([dateKey, slots]) => {
        const label = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(
          new Date(`${dateKey}T00:00:00Z`),
        );
        return {
          id: dateKey,
          label,
          slots: slots.slice(0, MAX_SLOTS_PER_DAY).map((slot) => ({
            id: slot.start,
            time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(slot.start)),
            label: `${label} at ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(slot.start))}`,
          })),
        };
      })
      .filter((day) => day.slots.length > 0);

    return days;
  } catch (error) {
    console.error("[calcom] Failed to fetch availability:", error);
    return null;
  }
}

export type CalcomBookingResult = { ok: true; bookingUid: string } | { ok: false; reason: string };

/**
 * Creates a real Cal.com booking for the slot the visitor picked (its `id`
 * from getCalcomAvailability is the ISO start time Cal.com expects back).
 * Only called when isConfigured(), the caller (bookingProvider.ts) checks
 * that first and otherwise leaves the request PENDING against mocked data.
 */
export async function createCalcomBooking(params: {
  slotStartIso: string;
  name: string;
  email: string;
  notes: string;
}): Promise<CalcomBookingResult> {
  if (!isConfigured()) return { ok: false, reason: "not_configured" };

  const apiKey = process.env.CALENDAR_PROVIDER_API_KEY;
  const eventTypeId = Number(process.env.CALENDAR_ID);

  try {
    const response = await fetch(`${CALCOM_API_BASE}/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify({
        eventTypeId,
        start: params.slotStartIso,
        attendee: {
          name: params.name,
          email: params.email,
          timeZone: "UTC",
        },
        metadata: { source: "axieonex-website" },
        bookingFieldsResponses: { notes: params.notes },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`[calcom] Booking request failed with status ${response.status}:`, text);
      return { ok: false, reason: `http_${response.status}` };
    }

    const body = (await response.json()) as { data?: { uid?: string } };
    const uid = body.data?.uid;
    if (!uid) {
      console.error("[calcom] Booking response had no uid:", body);
      return { ok: false, reason: "missing_uid" };
    }

    return { ok: true, bookingUid: uid };
  } catch (error) {
    console.error("[calcom] Failed to create booking:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "network_error" };
  }
}
