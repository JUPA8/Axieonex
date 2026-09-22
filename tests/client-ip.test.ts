import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => ({ get: mocks.get })) }));

import { getClientIp } from "@/lib/security/getClientIp";

describe("trusted proxy IP extraction", () => {
  afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

  it("ignores spoofable forwarding headers unless an owner configures a trusted boundary", async () => {
    vi.stubEnv("TRUSTED_PROXY_IP_HEADER", "");
    mocks.get.mockReturnValue("203.0.113.10");
    await expect(getClientIp()).resolves.toBe("unknown");
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("accepts one valid address from the configured normalized header", async () => {
    vi.stubEnv("TRUSTED_PROXY_IP_HEADER", "x-platform-client-ip");
    mocks.get.mockReturnValue("203.0.113.10");
    await expect(getClientIp()).resolves.toBe("203.0.113.10");
    expect(mocks.get).toHaveBeenCalledWith("x-platform-client-ip");
  });

  it("rejects multiple forwarded addresses and malformed values", async () => {
    vi.stubEnv("TRUSTED_PROXY_IP_HEADER", "x-platform-client-ip");
    mocks.get.mockReturnValueOnce("203.0.113.10, 10.0.0.1").mockReturnValueOnce("not-an-ip");
    await expect(getClientIp()).resolves.toBe("unknown");
    await expect(getClientIp()).resolves.toBe("unknown");
  });
});
