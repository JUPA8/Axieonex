"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { submitBookingAction } from "@/app/book-strategy-call/actions";
import { BookingIntro } from "@/components/booking/BookingIntro";
import { ReviewStep } from "@/components/booking/ReviewStep";
import { SlotSelector } from "@/components/booking/SlotSelector";
import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5 } from "@/lib/bookingValidation";
import { cn } from "@/lib/cn";
import { CONTACT_EMAIL } from "@/lib/site";
import { EMPTY_BOOKING_DATA, type BookingData, type BookingFieldErrors } from "@/types/booking";

type Step = 0 | 1 | 2 | 3 | 4 | 5;
type SubmitPhase = "idle" | "submitting" | "success" | "unavailable" | "error" | "rate_limited";

const SIZE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "1-10", label: "1 to 10" },
  { value: "11-50", label: "11 to 50" },
  { value: "51-200", label: "51 to 200" },
  { value: "201+", label: "201 or more" },
];

const BUDGET_OPTIONS = [
  { value: "", label: "Select" },
  { value: "under-3k", label: "Under $3,000" },
  { value: "3k-8k", label: "$3,000 to $8,000" },
  { value: "8k-20k", label: "$8,000 to $20,000" },
  { value: "20k-plus", label: "$20,000 and above" },
];

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] text-ax-text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-[12.5px] text-ax-error">
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT_CLASSES =
  "min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary focus:border-ax-violet";

export function BookingWizard({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<BookingData>(EMPTY_BOOKING_DATA);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [slotId, setSlotId] = useState<string | null>(null);
  const [slotLabel, setSlotLabel] = useState<string | null>(null);
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  function update<K extends keyof BookingData>(key: K, value: BookingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    let stepErrors: BookingFieldErrors = {};
    if (step === 1) stepErrors = validateStep1(data);
    if (step === 2) stepErrors = validateStep2(data);
    if (step === 3) stepErrors = validateStep3(data);
    if (step === 4) stepErrors = validateStep4(slotId);

    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setStep((s) => Math.min(5, s + 1) as Step);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1) as Step);
  }

  async function handleSubmit() {
    const consentErrors = validateStep5(data);
    setErrors(consentErrors);
    if (Object.keys(consentErrors).length > 0) return;

    setPhase("submitting");
    const result = await submitBookingAction(data, slotId ?? "", slotLabel ?? "", honeypot, turnstileToken);
    if (result.status === "success") setPhase("success");
    else if (result.status === "unavailable") setPhase("unavailable");
    else if (result.status === "rate_limited") setPhase("rate_limited");
    else setPhase("error");
  }

  function handleRetry() {
    setPhase("idle");
  }

  if (phase === "success") {
    return (
      <div role="status" aria-live="polite" className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Call requested.</h1>
        <p className="mx-auto mb-8 max-w-[52ch] text-[15px] leading-relaxed text-ax-text-muted">
          We will confirm your slot by email shortly, with a short pre-call brief covering what triggered your
          interest and what we will cover together.
        </p>
        <Button href="/" variant="secondary">
          Back to home
        </Button>
      </div>
    );
  }

  if (phase === "unavailable") {
    return (
      <div role="alert" className="rounded-lg border border-ax-warning/40 bg-ax-warning/10 p-10 text-center">
        <h1 className="mb-4 text-2xl font-bold">Booking isn&apos;t connected yet.</h1>
        <p className="mx-auto mb-8 max-w-[56ch] text-[15px] leading-relaxed text-ax-text-muted">
          Your details are validated and ready, but no calendar provider has been configured for this environment
          yet, so nothing has been booked. Please email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>{" "}
          and we will schedule your call by hand in the meantime. Nothing you entered was lost.
        </p>
        <Button href="/" variant="secondary">
          Back to home
        </Button>
      </div>
    );
  }

  if (phase === "rate_limited") {
    return (
      <div role="alert" className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Too many requests sent recently.</h1>
        <p className="mx-auto mb-8 max-w-[52ch] text-[15px] leading-relaxed text-ax-text-muted">
          Please wait a few minutes and try again, or email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          . Nothing you entered was lost.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="min-h-11 rounded-sm border border-white/15 px-7 py-3.5 text-sm font-semibold text-ax-text-primary"
        >
          Back
        </button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div role="alert" className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Something went wrong submitting your request.</h1>
        <p className="mx-auto mb-8 max-w-[52ch] text-[15px] leading-relaxed text-ax-text-muted">
          Nothing you entered was lost.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-7 py-3.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (step === 0) {
    return <BookingIntro onStart={() => setStep(1)} />;
  }

  const stepLabels = ["Personal details", "Company profile", "Revenue situation", "Select a date and time", "Review and confirm"];

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 flex gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5} aria-label="Booking progress">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={cn("h-2 w-2 rounded-full", step >= n ? "bg-ax-violet" : "bg-white/15")} />
          ))}
        </div>
        <div className="text-[11.5px] text-ax-text-muted">{stepLabels[step - 1]}</div>
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="mb-7 text-xl font-bold outline-none">
        {stepLabels[step - 1]}
      </h1>

      {/* Honeypot: visually hidden and unreachable by keyboard/AT, left
          empty by real visitors. A filled value marks the submission as spam. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="booking-website-confirm">Leave this field blank</label>
        <input
          id="booking-website-confirm"
          name="booking-website-confirm"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <Field id="name" label="Full name" error={errors.name}>
            <input id="name" className={INPUT_CLASSES} value={data.name} onChange={(e: ChangeEvent<HTMLInputElement>) => update("name", e.target.value)} />
          </Field>
          <Field id="email" label="Business email" error={errors.email}>
            <input id="email" type="email" className={INPUT_CLASSES} value={data.email} onChange={(e: ChangeEvent<HTMLInputElement>) => update("email", e.target.value)} />
          </Field>
          <Field id="phone" label="Phone number" error={errors.phone}>
            <input id="phone" type="tel" className={INPUT_CLASSES} value={data.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => update("phone", e.target.value)} />
          </Field>
          <Field id="role" label="Role" error={errors.role}>
            <input id="role" className={INPUT_CLASSES} value={data.role} onChange={(e: ChangeEvent<HTMLInputElement>) => update("role", e.target.value)} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <Field id="company" label="Company name" error={errors.company}>
            <input id="company" className={INPUT_CLASSES} value={data.company} onChange={(e: ChangeEvent<HTMLInputElement>) => update("company", e.target.value)} />
          </Field>
          <Field id="website" label="Company website" error={errors.website}>
            <input id="website" placeholder="yourcompany.com" className={INPUT_CLASSES} value={data.website} onChange={(e: ChangeEvent<HTMLInputElement>) => update("website", e.target.value)} />
          </Field>
          <Field id="country" label="Country" error={errors.country}>
            <input id="country" className={INPUT_CLASSES} value={data.country} onChange={(e: ChangeEvent<HTMLInputElement>) => update("country", e.target.value)} />
          </Field>
          <Field id="size" label="Company size" error={errors.size}>
            <select id="size" className={INPUT_CLASSES} value={data.size} onChange={(e: ChangeEvent<HTMLSelectElement>) => update("size", e.target.value)}>
              {SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <Field id="approach" label="Current outbound approach" error={errors.approach}>
            <textarea id="approach" rows={3} className={INPUT_CLASSES} value={data.approach} onChange={(e) => update("approach", e.target.value)} />
          </Field>
          <Field id="outcome" label="Desired outcome" error={errors.outcome}>
            <textarea id="outcome" rows={3} className={INPUT_CLASSES} value={data.outcome} onChange={(e) => update("outcome", e.target.value)} />
          </Field>
          <Field id="market" label="Target market" error={errors.market}>
            <input id="market" className={INPUT_CLASSES} value={data.market} onChange={(e: ChangeEvent<HTMLInputElement>) => update("market", e.target.value)} />
          </Field>
          <Field id="budget" label="Monthly engagement range" error={errors.budget}>
            <select id="budget" className={INPUT_CLASSES} value={data.budget} onChange={(e: ChangeEvent<HTMLSelectElement>) => update("budget", e.target.value)}>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {step === 4 && (
        <div>
          <SlotSelector
            selectedId={slotId}
            onSelect={(id, label) => {
              setSlotId(id);
              setSlotLabel(label);
              setErrors({});
            }}
          />
          {errors.slot && <p className="mt-4 text-[12.5px] text-ax-error">{errors.slot}</p>}
        </div>
      )}

      {step === 5 && (
        <>
          <ReviewStep
            data={data}
            slotLabel={slotLabel}
            consentError={errors.consent}
            onConsentChange={(value) => update("consent", value)}
            onEdit={() => setStep(1)}
          />
          <div className="mt-6">
            <TurnstileWidget siteKey={turnstileSiteKey} onVerify={setTurnstileToken} />
          </div>
        </>
      )}

      <div className="mt-9 flex justify-between">
        <button type="button" onClick={goBack} className="min-h-11 rounded-sm border border-white/15 px-6 py-3 text-sm text-ax-text-primary">
          Back
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={goNext}
            className="min-h-11 rounded-sm bg-ax-text-primary px-6 py-3 text-sm font-semibold text-[#05060b]"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={phase === "submitting"}
            className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {phase === "submitting" ? "Submitting..." : "Confirm request"}
          </button>
        )}
      </div>
    </div>
  );
}
