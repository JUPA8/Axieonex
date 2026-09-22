import "server-only";

import type { BookingData } from "@/types/booking";

export const CONTACT_PURPOSES = ["general", "service", "partnership", "media", "client"] as const;
export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201+"] as const;
export const BOOKING_BUDGETS = ["under-3k", "3k-8k", "8k-20k", "20k-plus"] as const;

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,189}\.[^\s@]{2,63}$/;
const PHONE_RE = /^[0-9+()\-\s]{7,40}$/;
const WEBSITE_RE = /^(https?:\/\/)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(?::\d{1,5})?(?:[/?#].*)?$/;

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length >= min && normalized.length <= max ? normalized : null;
}

function exactKeys(value: object, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function formHasOnly(formData: FormData, allowed: readonly string[]): boolean {
  return [...formData.keys()].every((key) => key.startsWith("$ACTION_") || allowed.includes(key));
}

export type ContactInput = { purpose: string; name: string; email: string; company: string; message: string; consent: true };

type ContactErrors = Partial<Record<"purpose" | "name" | "email" | "message" | "consent", string>>;

export function parseContactForm(formData: FormData): { ok: true; data: ContactInput } | { ok: false; errors: ContactErrors } {
  const allowed = ["purpose", "name", "email", "company", "message", "consent", "cf-turnstile-response", "website_url_confirm"];
  if (!formHasOnly(formData, allowed)) return { ok: false, errors: {} };
  const purpose = text(formData.get("purpose"), 1, 32);
  const name = text(formData.get("name"), 2, 100);
  const email = text(formData.get("email"), 3, 254)?.toLowerCase() ?? null;
  const companyRaw = formData.get("company");
  const company = companyRaw === null || companyRaw === "" ? "" : text(companyRaw, 1, 200);
  const message = text(formData.get("message"), 1, 5_000);
  const errors: ContactErrors = {};
  if (!purpose || !CONTACT_PURPOSES.includes(purpose as (typeof CONTACT_PURPOSES)[number])) errors.purpose = "Please select a topic.";
  if (!name) errors.name = "Please enter your name.";
  if (!email || !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (!message) errors.message = "Please enter a message.";
  if (formData.get("consent") !== "on") errors.consent = "Please accept the privacy terms.";
  if (company === null || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { purpose: purpose!, name: name!, email: email!, company: company!, message: message!, consent: true } };
}

const BOOKING_KEYS: (keyof BookingData)[] = ["name", "email", "phone", "role", "company", "website", "country", "size", "approach", "outcome", "market", "budget", "consent"];

export function parseBookingData(value: unknown): { ok: true; data: BookingData } | { ok: false } {
  if (typeof value !== "object" || value === null || !exactKeys(value, BOOKING_KEYS)) return { ok: false };
  const input = value as Record<keyof BookingData, unknown>;
  const name = text(input.name, 2, 100);
  const email = text(input.email, 3, 254)?.toLowerCase() ?? null;
  const phone = text(input.phone, 7, 40);
  const role = text(input.role, 2, 100);
  const company = text(input.company, 2, 200);
  const website = text(input.website, 3, 2_048);
  const country = text(input.country, 2, 100);
  const size = text(input.size, 1, 20);
  const approach = text(input.approach, 2, 2_000);
  const outcome = text(input.outcome, 2, 2_000);
  const market = text(input.market, 2, 200);
  const budget = text(input.budget, 1, 32);
  if (!name || !email || !EMAIL_RE.test(email) || !phone || !PHONE_RE.test(phone) || !role || !company || !website || !WEBSITE_RE.test(website) || !country || !size || !COMPANY_SIZES.includes(size as (typeof COMPANY_SIZES)[number]) || !approach || !outcome || !market || !budget || !BOOKING_BUDGETS.includes(budget as (typeof BOOKING_BUDGETS)[number]) || input.consent !== true) return { ok: false };
  return { ok: true, data: { name, email, phone, role, company, website, country, size, approach, outcome, market, budget, consent: true } };
}

export function parseLoginForm(formData: FormData): { ok: true; email: string; password: string } | { ok: false } {
  if (!formHasOnly(formData, ["email", "password"])) return { ok: false };
  const email = text(formData.get("email"), 3, 254)?.toLowerCase();
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  if (!email || !EMAIL_RE.test(email) || password.length < 8 || password.length > 200) return { ok: false };
  return { ok: true, email, password };
}

export function parseAuthCredentials(value: Partial<Record<"email" | "password", unknown>> | undefined): { email: string; password: string } | null {
  if (!value || !exactKeys(value, ["email", "password"])) return null;
  const email = text(value.email, 3, 254)?.toLowerCase();
  const password = typeof value.password === "string" ? value.password : "";
  return email && EMAIL_RE.test(email) && password.length >= 8 && password.length <= 200 ? { email, password } : null;
}

export const ARTICLE_FIELDS = ["slug", "title", "category", "color", "intro", "h2a", "bodyA", "h2b", "bodyB", "closing"] as const;
export type ArticleInput = Record<(typeof ARTICLE_FIELDS)[number], string> & { published: boolean };

export function parseArticleForm(formData: FormData): { ok: true; data: ArticleInput } | { ok: false; error: string } {
  if (!formHasOnly(formData, [...ARTICLE_FIELDS, "published"])) return { ok: false, error: "The submitted article contains unsupported fields." };
  const limits: Record<(typeof ARTICLE_FIELDS)[number], [number, number]> = { slug: [1, 120], title: [1, 200], category: [1, 100], color: [7, 7], intro: [1, 2_000], h2a: [1, 200], bodyA: [1, 20_000], h2b: [1, 200], bodyB: [1, 20_000], closing: [1, 5_000] };
  const values = {} as Record<(typeof ARTICLE_FIELDS)[number], string>;
  for (const field of ARTICLE_FIELDS) {
    const parsed = text(formData.get(field), ...limits[field]);
    if (!parsed) return { ok: false, error: `Please provide a valid value for "${field}".` };
    values[field] = parsed;
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) return { ok: false, error: "Slug must contain lowercase letters, numbers, and single hyphens only." };
  if (!/^#[0-9a-fA-F]{6}$/.test(values.color)) return { ok: false, error: "Color must be a hex value like #3E7BFA." };
  const publishedValue = formData.get("published");
  if (publishedValue !== null && publishedValue !== "on") return { ok: false, error: "Invalid published value." };
  return { ok: true, data: { ...values, published: publishedValue === "on" } };
}

export function parseConsentBody(value: unknown): { necessary: true; functional: boolean; analytics: boolean; preferences: boolean; marketing: boolean } | null {
  if (typeof value !== "object" || value === null || !exactKeys(value, ["categories"])) return null;
  const categories = (value as { categories?: unknown }).categories;
  if (typeof categories !== "object" || categories === null || !exactKeys(categories, ["necessary", "functional", "analytics", "preferences", "marketing"])) return null;
  const record = categories as Record<string, unknown>;
  if (record.necessary !== true || [record.functional, record.analytics, record.preferences, record.marketing].some((item) => typeof item !== "boolean")) return null;
  return { necessary: true, functional: record.functional as boolean, analytics: record.analytics as boolean, preferences: record.preferences as boolean, marketing: record.marketing as boolean };
}

export function isSafeRecordId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}
