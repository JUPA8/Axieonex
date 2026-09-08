import { TransitionLink } from "@/components/transition/TransitionLink";
import type { BookingData } from "@/types/booking";

export function ReviewStep({
  data,
  slotLabel,
  consentError,
  onConsentChange,
  onEdit,
}: {
  data: BookingData;
  slotLabel: string | null;
  consentError?: string;
  onConsentChange: (value: boolean) => void;
  onEdit: () => void;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">Review and confirm</h2>
        <button type="button" onClick={onEdit} className="text-sm text-ax-text-muted underline hover:text-ax-text-primary">
          Edit details
        </button>
      </div>
      <div className="mb-7 flex flex-col gap-2.5 text-sm text-ax-text-body">
        <div>
          <strong className="text-ax-text-primary">{data.name}</strong> · {data.role}
        </div>
        <div>
          {data.email} · {data.phone}
        </div>
        <div>
          {data.company} · {data.website} · {data.size} employees · {data.country}
        </div>
        <div className="border-t border-white/8 pt-2.5">Target market: {data.market}</div>
        <div>Current approach: {data.approach}</div>
        <div>Desired outcome: {data.outcome}</div>
        <div>Engagement range: {data.budget}</div>
        <div className="border-t border-white/8 pt-2.5 text-ax-cyan-alt">{slotLabel ?? "No time selected yet."}</div>
      </div>
      {/*
        The checkbox is wrapped in the label for a large click target, but its
        accessible name is set explicitly via aria-labelledby rather than
        relying on implicit label-wrapping: nested interactive links inside a
        wrapping <label> make the browser's accessible-name computation
        unreliable (observed announcing "on" instead of the consent text).
      */}
      <label htmlFor="booking-consent" className="flex items-start gap-3 text-[13.5px] text-ax-text-muted">
        <input
          id="booking-consent"
          type="checkbox"
          checked={data.consent}
          onChange={(e) => onConsentChange(e.target.checked)}
          aria-labelledby="booking-consent-text"
          aria-describedby={consentError ? "booking-consent-error" : undefined}
          className="mt-1 h-[18px] w-[18px]"
        />
        <span id="booking-consent-text">
          I agree to be contacted about this request and have read the{" "}
          <TransitionLink href="/privacy" className="underline hover:text-ax-text-primary">
            Privacy Policy
          </TransitionLink>{" "}
          and{" "}
          <TransitionLink href="/terms" className="underline hover:text-ax-text-primary">
            Terms of Service
          </TransitionLink>
          .
        </span>
      </label>
      {consentError && (
        <p id="booking-consent-error" className="mt-2 text-[12.5px] text-ax-error">
          {consentError}
        </p>
      )}
    </div>
  );
}
