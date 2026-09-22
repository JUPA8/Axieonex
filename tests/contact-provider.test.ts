import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), email: vi.fn(), crm: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { contactSubmission: { create: mocks.create, update: mocks.update } } }));
vi.mock("@/lib/email", () => ({ sendNotificationEmail: mocks.email }));
vi.mock("@/lib/crm", () => ({ pushToCrm: mocks.crm }));

import { sendContactForm } from "@/lib/contactProvider";

const payload = { purpose: "general", name: "Jane", email: "jane@example.com", company: "Acme", message: "Hello", ipAddress: "unknown" };

describe("contact persistence with secondary provider failures", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ id: "submission-1" }); mocks.update.mockResolvedValue({}); });

  it("keeps the durable submission successful and leaves sync timestamps unset", async () => {
    mocks.email.mockResolvedValue({ sent: false, reason: "timeout" });
    mocks.crm.mockResolvedValue({ ok: false, reason: "provider_error" });
    await expect(sendContactForm(payload)).resolves.toEqual({ ok: true });
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
