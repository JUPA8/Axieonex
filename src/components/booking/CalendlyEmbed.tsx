"use client";

import { useEffect } from "react";
import Script from "next/script";
import { CONTACT_EMAIL } from "@/lib/site";

type CalendlyMessage =
  | { event: "calendly.date_and_time_selected"; payload?: { time?: string } }
  | { event: "calendly.event_scheduled"; payload?: { event?: { uri?: string }; invitee?: { uri?: string } } }
  | { event: string; payload?: unknown };

/**
 * Real Calendly inline embed (Book Strategy Call, final step) rather than
 * our own slot picker: Calendly owns availability, conflict handling, and
 * the actual confirmation email/invite. `url` is NEXT_PUBLIC_CALENDLY_URL;
 * unset, this renders an honest "not connected yet" notice instead of a
 * broken embed, matching the rest of this project's graceful-degradation
 * pattern for optional integrations.
 *
 * `date_and_time_selected` fires as soon as a slot is picked (before the
 * visitor's own final click inside the widget); `event_scheduled` fires
 * once Calendly has actually booked it, carrying the real event/invitee
 * URIs. Both are read from postMessage, checked against Calendly's own
 * origin so an unrelated script on the page can't spoof a fake booking.
 */
export function CalendlyEmbed({
  url,
  name,
  email,
  correlationId,
  onDateTimeSelected,
  onScheduled,
}: {
  url?: string;
  name: string;
  email: string;
  correlationId: string;
  onDateTimeSelected: (iso: string) => void;
  onScheduled: (eventUri: string, inviteeUri: string) => void;
}) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.origin.endsWith(".calendly.com") && event.origin !== "https://calendly.com") return;
      if (typeof event.data !== "object" || event.data === null) return;
      const message = event.data as CalendlyMessage;
      if (message.event === "calendly.date_and_time_selected") {
        const time = (message.payload as { time?: string } | undefined)?.time;
        if (time) onDateTimeSelected(time);
      }
      if (message.event === "calendly.event_scheduled") {
        const payload = message.payload as { event?: { uri?: string }; invitee?: { uri?: string } } | undefined;
        if (payload?.event?.uri && payload?.invitee?.uri) {
          onScheduled(payload.event.uri, payload.invitee.uri);
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onDateTimeSelected, onScheduled]);

  if (!url) {
    return (
      <div role="alert" className="border-l-2 border-ax-warning py-3 pl-7">
        <p className="mx-auto max-w-[52ch] text-[15px] leading-relaxed text-ax-text-muted">
          Scheduling isn&apos;t connected yet. Please email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>{" "}
          and we will book your call by hand.
        </p>
      </div>
    );
  }

  const embedUrl = new URL(url);
  embedUrl.searchParams.set("name", name);
  embedUrl.searchParams.set("email", email);
  embedUrl.searchParams.set("hide_gdpr_banner", "1");
  embedUrl.searchParams.set("utm_source", "axieonex");
  embedUrl.searchParams.set("utm_content", correlationId);

  return (
    <>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      <div className="calendly-inline-widget" data-url={embedUrl.toString()} style={{ minWidth: "280px", height: "700px" }} />
    </>
  );
}
