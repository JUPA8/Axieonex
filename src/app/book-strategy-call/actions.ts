"use server";

import { submitBooking } from "@/lib/bookingProvider";
import { validateStep1, validateStep2, validateStep3, validateStep5 } from "@/lib/bookingValidation";
import type { BookingData } from "@/types/booking";

export type BookingSubmitResult = { status: "success" } | { status: "unavailable" } | { status: "error" } | { status: "invalid" };

export async function submitBookingAction(data: BookingData, slotLabel: string): Promise<BookingSubmitResult> {
  const errors = {
    ...validateStep1(data),
    ...validateStep2(data),
    ...validateStep3(data),
    ...validateStep5(data),
  };
  if (!slotLabel || Object.keys(errors).length > 0) {
    return { status: "invalid" };
  }

  const result = await submitBooking({ ...data, slotLabel });
  if (result.ok) return { status: "success" };
  if (result.reason === "not_configured") return { status: "unavailable" };
  return { status: "error" };
}
