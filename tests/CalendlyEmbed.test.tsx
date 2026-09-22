import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";

const NOOP = () => {};

describe("CalendlyEmbed", () => {
  it("shows an honest not-connected notice instead of a broken embed when no URL is configured", () => {
    const { container, getByRole } = render(
      <CalendlyEmbed url={undefined} name="Jane Doe" email="jane@example.com" correlationId="axieonex_test" onDateTimeSelected={NOOP} onScheduled={NOOP} />,
    );
    expect(getByRole("alert")).toHaveTextContent("Scheduling isn't connected yet");
    expect(container.querySelector(".calendly-inline-widget")).toBeNull();
  });

  it("renders the inline widget prefilled with the visitor's name and email when a URL is configured", () => {
    const { container } = render(
      <CalendlyEmbed
        url="https://calendly.com/example/strategy-call"
        name="Jane Doe"
        email="jane@example.com"
        correlationId="axieonex_test"
        onDateTimeSelected={NOOP}
        onScheduled={NOOP}
      />,
    );
    const widget = container.querySelector(".calendly-inline-widget");
    expect(widget).not.toBeNull();
    const dataUrl = widget?.getAttribute("data-url") ?? "";
    expect(dataUrl).toContain("https://calendly.com/example/strategy-call?");
    expect(dataUrl).toContain("name=Jane+Doe");
    expect(dataUrl).toContain("email=jane%40example.com");
    expect(dataUrl).toContain("utm_content=axieonex_test");
  });

  it("ignores a postMessage from an origin other than Calendly", () => {
    const onScheduled = vi.fn();
    render(
      <CalendlyEmbed
        url="https://calendly.com/example/strategy-call"
        name="Jane Doe"
        email="jane@example.com"
        correlationId="axieonex_test"
        onDateTimeSelected={NOOP}
        onScheduled={onScheduled}
      />,
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://evil.example",
        data: { event: "calendly.event_scheduled", payload: { event: { uri: "x" }, invitee: { uri: "y" } } },
      }),
    );
    expect(onScheduled).not.toHaveBeenCalled();
  });

  it("calls onDateTimeSelected and onScheduled for genuine Calendly messages", () => {
    const onDateTimeSelected = vi.fn();
    const onScheduled = vi.fn();
    render(
      <CalendlyEmbed
        url="https://calendly.com/example/strategy-call"
        name="Jane Doe"
        email="jane@example.com"
        correlationId="axieonex_test"
        onDateTimeSelected={onDateTimeSelected}
        onScheduled={onScheduled}
      />,
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://calendly.com",
        data: { event: "calendly.date_and_time_selected", payload: { time: "2026-01-01T09:00:00.000Z" } },
      }),
    );
    expect(onDateTimeSelected).toHaveBeenCalledWith("2026-01-01T09:00:00.000Z");

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://calendly.com",
        data: {
          event: "calendly.event_scheduled",
          payload: {
            event: { uri: "https://api.calendly.com/scheduled_events/abc" },
            invitee: { uri: "https://api.calendly.com/scheduled_events/abc/invitees/def" },
          },
        },
      }),
    );
    expect(onScheduled).toHaveBeenCalledWith(
      "https://api.calendly.com/scheduled_events/abc",
      "https://api.calendly.com/scheduled_events/abc/invitees/def",
    );
  });
});
