export type BookingData = {
  name: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  website: string;
  country: string;
  size: string;
  approach: string;
  outcome: string;
  market: string;
  budget: string;
  consent: boolean;
};

export const EMPTY_BOOKING_DATA: BookingData = {
  name: "",
  email: "",
  phone: "",
  role: "",
  company: "",
  website: "",
  country: "",
  size: "",
  approach: "",
  outcome: "",
  market: "",
  budget: "",
  consent: false,
};

export type TimeSlot = {
  id: string;
  time: string;
  label: string;
};

export type AvailabilityDay = {
  id: string;
  label: string;
  slots: TimeSlot[];
};

export type BookingFieldErrors = Partial<Record<keyof BookingData | "slot", string>>;
