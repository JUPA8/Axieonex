"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactAction, type ContactFormState } from "@/app/contact/actions";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CONTACT_EMAIL } from "@/lib/site";

const INITIAL_STATE: ContactFormState = { status: "idle", errors: {} };

const PURPOSE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "general", label: "General enquiry" },
  { value: "service", label: "Service enquiry" },
  { value: "partnership", label: "Partnership enquiry" },
  { value: "media", label: "Media or editorial enquiry" },
  { value: "client", label: "Existing client" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-7 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Sending..." : "Send message"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, INITIAL_STATE);

  if (state.status === "success") {
    return (
      <div role="status" aria-live="polite" className="rounded-lg border border-white/10 bg-white/[0.02] p-10 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-ax-cyan-alt/15 text-2xl text-ax-cyan-alt">
          ✓
        </div>
        <h2 className="mb-3 text-xl font-bold">Message sent.</h2>
        <p className="text-sm leading-relaxed text-ax-text-muted">
          We route enquiries to the right team and reply within one business day.
        </p>
      </div>
    );
  }

  if (state.status === "unavailable") {
    return (
      <div role="alert" className="rounded-lg border border-ax-warning/40 bg-ax-warning/10 p-10 text-center">
        <h2 className="mb-3 text-xl font-bold">Message delivery isn&apos;t connected yet.</h2>
        <p className="text-sm leading-relaxed text-ax-text-muted">
          This form is validated and ready, but no email or CRM delivery provider has been configured for this
          environment. Please write to us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>{" "}
          in the meantime.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.status === "error" && (
        <p role="alert" className="rounded-sm border border-ax-error/40 bg-ax-error/10 px-4 py-3 text-sm text-ax-error">
          Something went wrong sending your message. Please try again.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="purpose" className="text-[13px] text-ax-text-muted">
          What is this about?
        </label>
        <select
          id="purpose"
          name="purpose"
          aria-invalid={Boolean(state.errors.purpose)}
          aria-describedby={state.errors.purpose ? "purpose-error" : undefined}
          className="min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary"
        >
          {PURPOSE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {state.errors.purpose && (
          <p id="purpose-error" className="text-[12.5px] text-ax-error">
            {state.errors.purpose}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-[13px] text-ax-text-muted">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          aria-invalid={Boolean(state.errors.name)}
          aria-describedby={state.errors.name ? "name-error" : undefined}
          className="min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary"
        />
        {state.errors.name && (
          <p id="name-error" className="text-[12.5px] text-ax-error">
            {state.errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[13px] text-ax-text-muted">
          Business email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          aria-invalid={Boolean(state.errors.email)}
          aria-describedby={state.errors.email ? "email-error" : undefined}
          className="min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary"
        />
        {state.errors.email && (
          <p id="email-error" className="text-[12.5px] text-ax-error">
            {state.errors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="company" className="text-[13px] text-ax-text-muted">
          Company (optional)
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className="min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-[13px] text-ax-text-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={Boolean(state.errors.message)}
          aria-describedby={state.errors.message ? "message-error" : undefined}
          className="rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary"
        />
        {state.errors.message && (
          <p id="message-error" className="text-[12.5px] text-ax-error">
            {state.errors.message}
          </p>
        )}
      </div>

      {/*
        Accessible name set explicitly via aria-labelledby rather than relying
        on implicit label-wrapping: a nested interactive link inside a
        wrapping <label> makes the browser's accessible-name computation
        unreliable (observed announcing "on" instead of the consent text).
      */}
      <label htmlFor="consent" className="flex items-start gap-3 text-[13.5px] text-ax-text-muted">
        <input
          id="consent"
          type="checkbox"
          name="consent"
          aria-labelledby="consent-text"
          aria-describedby={state.errors.consent ? "consent-error" : undefined}
          className="mt-1 h-[18px] w-[18px]"
        />
        <span id="consent-text">
          I agree to be contacted about this enquiry and have read the{" "}
          <TransitionLink href="/privacy" className="underline hover:text-ax-text-primary">
            Privacy Policy
          </TransitionLink>
          .
        </span>
      </label>
      {state.errors.consent && (
        <p id="consent-error" className="-mt-3 text-[12.5px] text-ax-error">
          {state.errors.consent}
        </p>
      )}

      <div className="mt-2 flex items-center gap-5">
        <SubmitButton />
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-ax-text-muted hover:text-ax-text-primary">
          Or write to us directly at {CONTACT_EMAIL}.
        </a>
      </div>
    </form>
  );
}
