import type { BookingStatus, ProviderOperationState } from "@prisma/client";
import { PROVIDER_STATE_DESCRIPTIONS, PROVIDER_STATE_LABELS } from "@/lib/providerState";

export function formatAdminDate(date: Date | null): string {
  if (!date) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

export function providerStatePresentation(state: ProviderOperationState) {
  return { label: PROVIDER_STATE_LABELS[state], description: PROVIDER_STATE_DESCRIPTIONS[state] };
}

export function calendlyStatePresentation(input: {
  status: BookingStatus;
  hasCorrelation: boolean;
  confirmedAt: Date | null;
}) {
  if (input.status === "CONFIRMED") {
    return { label: "Confirmed", description: "A verified Calendly webhook confirmed this booking." };
  }
  if (input.status === "CANCELLED") {
    return { label: "Cancelled", description: "The persisted booking status is cancelled." };
  }
  if (input.hasCorrelation) {
    return { label: "Pending", description: "Awaiting a verified Calendly confirmation webhook." };
  }
  return {
    label: "Legacy / unknown",
    description: "This pending record has no stored Calendly correlation evidence, so its provider state cannot be proven.",
  };
}

export function isValidAdminRecordId(value: string): boolean {
  return /^[a-z0-9]{20,32}$/i.test(value);
}
