import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AnalyticsScript } from "@/components/analytics/AnalyticsScript";
import { ALL_ACCEPTED_CONSENT, DEFAULT_CONSENT, writeConsent } from "@/lib/consent";

describe("AnalyticsScript", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders nothing when no analytics provider is configured, even with consent granted", async () => {
    await writeConsent(ALL_ACCEPTED_CONSENT);
    const { container } = render(<AnalyticsScript domain={undefined} />);
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders nothing when a provider is configured but consent has not been granted", () => {
    const { container } = render(<AnalyticsScript domain="axieonex.com" />);
    expect(container.querySelector('script[data-domain="axieonex.com"]')).toBeNull();
  });

  it("renders nothing when consent for every other category is granted but analytics specifically is not", async () => {
    await writeConsent({ ...DEFAULT_CONSENT, functional: true, marketing: true });
    const { container } = render(<AnalyticsScript domain="axieonex.com" />);
    expect(container.querySelector('script[data-domain="axieonex.com"]')).toBeNull();
  });

  it("loads the script only once a provider is configured and analytics consent is granted", async () => {
    await writeConsent(ALL_ACCEPTED_CONSENT);
    render(<AnalyticsScript domain="axieonex.com" />);
    const script = document.querySelector('script[data-domain="axieonex.com"]');
    expect(script).not.toBeNull();
    expect(script).toHaveAttribute("src", "https://plausible.io/js/script.js");
  });
});
