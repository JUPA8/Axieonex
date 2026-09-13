/**
 * Name of the hidden honeypot field added to public forms. Legitimate users
 * never see or fill it (visually hidden, not `type="hidden"` — real bots
 * that fill every visible-looking input will still catch it, while
 * `display:none`/`aria-hidden` keeps it invisible and unannounced to screen
 * readers). A submission with this field non-empty is treated as spam.
 */
export const HONEYPOT_FIELD_NAME = "website_url_confirm";

/** True if the raw honeypot field value indicates a spam submission. */
export function isHoneypotValueTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * FormData convenience wrapper. Callers should respond exactly as if the
 * submission had succeeded (never reveal that spam detection exists) rather
 * than surfacing an error when this returns true.
 */
export function isHoneypotTripped(formData: FormData): boolean {
  return isHoneypotValueTripped(formData.get(HONEYPOT_FIELD_NAME));
}
