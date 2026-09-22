import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout, ProviderTimeoutError } from "@/lib/security/providerRequest";

describe("provider request timeout", () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("aborts a hanging fetch at the bounded deadline", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url, init: RequestInit) => new Promise((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(init.signal?.reason)))));
    const request = fetchWithTimeout("https://provider.example", {}, 50);
    const expectation = expect(request).rejects.toBeInstanceOf(ProviderTimeoutError);
    await vi.advanceTimersByTimeAsync(51);
    await expectation;
  });
});
