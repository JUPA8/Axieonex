import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findFirst: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { admin: { findFirst: mocks.findFirst } } }));

import { requireAdmin } from "@/lib/adminAuthorization";

describe("requireAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a missing session without querying the database", async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("Not authorized.");
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it.each(["deleted", "disabled"])("rejects a %s admin", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.findFirst.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("Not authorized.");
    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "admin-1", active: true } }));
  });

  it("returns the current active database identity", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.findFirst.mockResolvedValue({ id: "admin-1", email: "current@example.com" });
    await expect(requireAdmin()).resolves.toEqual({ id: "admin-1", email: "current@example.com" });
  });
});
