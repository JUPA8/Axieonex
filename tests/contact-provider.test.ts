import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), email: vi.fn(), crm: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { contactSubmission: { create: mocks.create, update: mocks.update } } }));
vi.mock("@/lib/email", () => ({ sendNotificationEmail: mocks.email }));
vi.mock("@/lib/crm", () => ({ pushToCrm: mocks.crm }));

import { sendContactForm } from "@/lib/contactProvider";

const payload = { purpose: "general", name: "Jane", email: "jane@example.com", company: "Acme", message: "Hello", ipAddress: "unknown" };

describe("contact persistence with secondary provider failures", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ id: "submission-1" }); mocks.update.mockResolvedValue({}); });

  it("keeps the durable submission successful and records configured provider failures", async () => {
    mocks.email.mockResolvedValue({ sent: false, reason: "timeout" });
    mocks.crm.mockResolvedValue({ ok: false, reason: "provider_error" });
    await expect(sendContactForm(payload)).resolves.toEqual({ ok: true });
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.update).toHaveBeenCalledTimes(2);
    expect(mocks.update).toHaveBeenNthCalledWith(1, {
      where: { id: "submission-1" },
      data: { emailState: "FAILED", emailStateUpdatedAt: expect.any(Date) },
    });
    expect(mocks.update).toHaveBeenNthCalledWith(2, {
      where: { id: "submission-1" },
      data: { crmState: "FAILED", crmStateUpdatedAt: expect.any(Date) },
    });
  });

  it("records disabled providers without inventing success timestamps", async () => {
    mocks.email.mockResolvedValue({ sent: false, reason: "not_configured" });
    mocks.crm.mockResolvedValue({ ok: false, reason: "not_configured" });
    await expect(sendContactForm(payload)).resolves.toEqual({ ok: true });
    expect(mocks.update).toHaveBeenNthCalledWith(1, {
      where: { id: "submission-1" },
      data: { emailState: "DISABLED", emailStateUpdatedAt: expect.any(Date) },
    });
    expect(mocks.update).toHaveBeenNthCalledWith(2, {
      where: { id: "submission-1" },
      data: { crmState: "DISABLED", crmStateUpdatedAt: expect.any(Date) },
    });
  });

  it("records success only with matching durable timestamps", async () => {
    mocks.email.mockResolvedValue({ sent: true });
    mocks.crm.mockResolvedValue({ ok: true });
    await expect(sendContactForm(payload)).resolves.toEqual({ ok: true });
    expect(mocks.update).toHaveBeenNthCalledWith(1, {
      where: { id: "submission-1" },
      data: {
        emailState: "SUCCEEDED",
        emailStateUpdatedAt: expect.any(Date),
        emailSentAt: expect.any(Date),
      },
    });
    expect(mocks.update).toHaveBeenNthCalledWith(2, {
      where: { id: "submission-1" },
      data: {
        crmState: "SUCCEEDED",
        crmStateUpdatedAt: expect.any(Date),
        crmSyncedAt: expect.any(Date),
      },
    });
  });
});
