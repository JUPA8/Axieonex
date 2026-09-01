"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTRY_OPTIONS, ROLE_OPTIONS, COMPANY_SIZE_OPTIONS, BUDGET_OPTIONS } from "@/lib/formOptions";
import { cn } from "@/lib/cn";
import { useDemoModal } from "./DemoModalContext";
import {
  EMPTY_DEMO_FORM,
  NOTES_MAX_LENGTH,
  validateDemoForm,
  type DemoFormErrors,
  type DemoFormValues,
} from "./validation";

const FIELD_CLASSES =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";
const LABEL_CLASSES = "mb-1.5 block text-sm text-[var(--color-fg)]";
const ERROR_CLASSES = "mt-1 text-xs text-red-400";

export function DemoModal() {
  const { isOpen, close } = useDemoModal();
  const [values, setValues] = useState<DemoFormValues>(EMPTY_DEMO_FORM);
  const [errors, setErrors] = useState<DemoFormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [notConfiguredNotice, setNotConfiguredNotice] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Reset the form when the modal transitions to open, adjusted during
  // render itself rather than in an effect (see
  // https://react.dev/learn/you-might-not-need-an-effect).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setValues(EMPTY_DEMO_FORM);
      setErrors({});
      setSubmitAttempted(false);
      setNotConfiguredNotice(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    firstFieldRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  function setField<K extends keyof DemoFormValues>(key: K, value: DemoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    const nextErrors = validateDemoForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      // No backend is configured in this local reconstruction — never claim
      // a successful submission. See docs/BACKEND_REQUIREMENTS.md.
      setNotConfiguredNotice(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-6 sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="demo-modal-title" className="text-xl font-bold text-[var(--color-fg)]">
              Book Your Free Strategy Call
            </h2>
            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
              Fill out the form below to see if your company qualifies for Axieonex&apos;s hybrid AI
              sales system.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            ✕
          </button>
        </div>

        {notConfiguredNotice ? (
          <div
            role="status"
            className="rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] p-4 text-sm text-[var(--color-fg)]"
          >
            <p className="font-semibold">Your details look good — but this form isn&apos;t wired up yet.</p>
            <p className="mt-2 text-[var(--color-fg-muted)]">
              This local reconstruction doesn&apos;t send data anywhere. Nothing was submitted. Real
              delivery (email, CRM, etc.) needs backend integration — see{" "}
              <code className="text-[var(--color-accent)]">docs/BACKEND_REQUIREMENTS.md</code>.
            </p>
            <button
              type="button"
              onClick={() => setNotConfiguredNotice(false)}
              className="mt-3 text-sm font-semibold text-[var(--color-accent)] hover:underline"
            >
              Back to form
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Full Name" required error={submitAttempted ? errors.fullName : undefined}>
              <input
                ref={firstFieldRef}
                type="text"
                placeholder="John Doe"
                className={FIELD_CLASSES}
                value={values.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
              />
            </Field>

            <Field label="Company Name" required error={submitAttempted ? errors.companyName : undefined}>
              <input
                type="text"
                placeholder="Acme Inc."
                className={FIELD_CLASSES}
                value={values.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
              />
            </Field>

            <Field label="Your Role / Position" required error={submitAttempted ? errors.role : undefined}>
              <select
                className={FIELD_CLASSES}
                value={values.role}
                onChange={(e) => setField("role", e.target.value)}
              >
                <option value="">Select Role</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Company Website"
              required
              error={submitAttempted ? errors.companyWebsite : undefined}
            >
              <input
                type="text"
                placeholder="www.company.com"
                className={FIELD_CLASSES}
                value={values.companyWebsite}
                onChange={(e) => setField("companyWebsite", e.target.value)}
              />
            </Field>

            <Field
              label="Business Email"
              required
              error={submitAttempted ? errors.businessEmail : undefined}
            >
              <input
                type="email"
                placeholder="john@company.com"
                className={FIELD_CLASSES}
                value={values.businessEmail}
                onChange={(e) => setField("businessEmail", e.target.value)}
              />
            </Field>

            <Field label="Phone Number" required error={submitAttempted ? errors.phoneNumber : undefined}>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className={FIELD_CLASSES}
                value={values.phoneNumber}
                onChange={(e) => setField("phoneNumber", e.target.value)}
              />
            </Field>

            <Field
              label="Company Size"
              required
              error={submitAttempted ? errors.companySize : undefined}
            >
              <select
                className={FIELD_CLASSES}
                value={values.companySize}
                onChange={(e) => setField("companySize", e.target.value)}
              >
                <option value="">Select Size</option>
                {COMPANY_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Country" required error={submitAttempted ? errors.country : undefined}>
              <select
                className={FIELD_CLASSES}
                value={values.country}
                onChange={(e) => setField("country", e.target.value)}
              >
                <option value="">Select Country</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">
                Axieonex operates internationally, with active campaigns across North America, Europe,
                and selected global markets.
              </p>
            </Field>

            <Field
              label="Monthly Budget"
              required
              error={submitAttempted ? errors.monthlyBudget : undefined}
            >
              <select
                className={FIELD_CLASSES}
                value={values.monthlyBudget}
                onChange={(e) => setField("monthlyBudget", e.target.value)}
              >
                <option value="">Select Budget</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="demo-notes" className="text-sm text-[var(--color-fg)]">
                  What are you hoping to improve in your sales pipeline?{" "}
                  <span className="text-[var(--color-fg-subtle)]">(Optional)</span>
                </label>
                <span className="text-xs text-[var(--color-fg-subtle)]">
                  {values.notes.length}/{NOTES_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="demo-notes"
                placeholder="e.g., Lead quality, response rates, team efficiency"
                className={cn(FIELD_CLASSES, "min-h-20 resize-y")}
                maxLength={NOTES_MAX_LENGTH}
                value={values.notes}
                onChange={(e) => setField("notes", e.target.value)}
              />
              {submitAttempted && errors.notes ? <p className={ERROR_CLASSES}>{errors.notes}</p> : null}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#04141a] hover:bg-[var(--color-accent-strong)]"
            >
              Request My Free Strategy Call
            </button>
            <p className="text-center text-xs text-[var(--color-fg-subtle)]">
              We respect your privacy. Your information is used only to prepare your strategy session.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={LABEL_CLASSES}>
        {label} {required ? <span className="text-red-400">*</span> : null}
      </label>
      {children}
      {error ? <p className={ERROR_CLASSES}>{error}</p> : null}
    </div>
  );
}
