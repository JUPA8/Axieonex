import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { ConsentSync } from "@/components/cookies/ConsentSync";
import { readConsent } from "@/lib/consent";

describe("ConsentSync", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(global.fetch).mockClear();
  });

  it("renders nothing", () => {
    const { container } = render(<ConsentSync />);
    expect(container).toBeEmptyDOMElement();
  });

  it("calls the server to reconcile the local cache on mount", () => {
    render(<ConsentSync />);
    expect(global.fetch).toHaveBeenCalledWith("/api/consent");
  });

  it("adopts a server-returned record when the local cache is empty", async () => {
    const serverRecord = {
      version: 1,
      categories: { necessary: true, functional: true, analytics: true, preferences: false, marketing: false },
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ record: serverRecord }), { status: 200 }),
    );
    render(<ConsentSync />);
    await waitFor(() => {
      expect(readConsent()?.categories).toEqual(serverRecord.categories);
    });
  });
});
