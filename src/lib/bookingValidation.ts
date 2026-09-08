import type { BookingData, BookingFieldErrors } from "@/types/booking";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-\s]{7,}$/;
const WEBSITE_RE = /^(https?:\/\/)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+.*$/;

export function validateStep1(data: BookingData): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  if (!data.name.trim()) errors.name = "Please enter your full name.";
  if (!data.email.trim() || !EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email address.";
  if (!data.phone.trim() || !PHONE_RE.test(data.phone)) errors.phone = "Please enter a valid phone number.";
  if (!data.role.trim()) errors.role = "Please enter your role.";
  return errors;
}

export function validateStep2(data: BookingData): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  if (!data.company.trim()) errors.company = "Please enter your company name.";
  if (!data.website.trim() || !WEBSITE_RE.test(data.website)) errors.website = "Please enter a valid website.";
  if (!data.country.trim()) errors.country = "Please enter your country.";
  if (!data.size) errors.size = "Please select a company size.";
  return errors;
}

export function validateStep3(data: BookingData): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  if (!data.approach.trim()) errors.approach = "Please describe your current approach.";
  if (!data.outcome.trim()) errors.outcome = "Please describe your desired outcome.";
  if (!data.market.trim()) errors.market = "Please enter your target market.";
  if (!data.budget) errors.budget = "Please select a range.";
  return errors;
}

export function validateStep4(selectedSlot: string | null): BookingFieldErrors {
  return selectedSlot ? {} : { slot: "Please select a date and time." };
}

export function validateStep5(data: BookingData): BookingFieldErrors {
  return data.consent ? {} : { consent: "Please accept the privacy terms to continue." };
}
