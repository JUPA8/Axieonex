"use server";

import { sendContactForm } from "@/lib/contactProvider";

export type ContactFormState = {
  status: "idle" | "success" | "unavailable" | "error";
  errors: Partial<Record<"purpose" | "name" | "email" | "message" | "consent", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactAction(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const purpose = String(formData.get("purpose") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";

  const errors: ContactFormState["errors"] = {};
  if (!purpose) errors.purpose = "Please select a topic.";
  if (!name) errors.name = "Please enter your name.";
  if (!email || !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (!message) errors.message = "Please enter a message.";
  if (!consent) errors.consent = "Please accept the privacy terms.";

  if (Object.keys(errors).length > 0) {
    return { status: "idle", errors };
  }

  const result = await sendContactForm({ purpose, name, email, company, message });

  if (result.ok) return { status: "success", errors: {} };
  if (result.reason === "not_configured") return { status: "unavailable", errors: {} };
  return { status: "error", errors: {} };
}
