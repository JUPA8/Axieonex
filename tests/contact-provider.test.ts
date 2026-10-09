import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), email: vi.fn(), ack: vi.fn(), crm: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { contactSubmission: { create: mocks.create, update: mocks.update } } }));
vi.mock("@/lib/email", () => ({ sendNotificationEmail: mocks.email, sendContactAcknowledgementEmail: mocks.ack }));
vi.mock("@/lib/crm", () => ({ pushToCrm: mocks.crm }));

import { sendContactForm } from "@/lib/contactProvider";

const payload = { purpose: "general", name: "Jane", email: "jane@example.com", company: "Acme", message: "Hello", ipAddress: "unknown" };

describe("contact persistence with secondary provider failures", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ id: "submission-1" }); mocks.update.mockResolvedValue({}); mocks.ack.mockResolvedValue({ sent: true }); });

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

describe("acknowledgement to the submitter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue({ id: "submission-1" });
    mocks.update.mockResolvedValue({});
    mocks.email.mockResolvedValue({ sent: true });
    mocks.crm.mockResolvedValue({ ok: false, reason: "not_configured" });
  });

  it("mails the person who submitted the form, with their enquiry type", async () => {
    mocks.ack.mockResolvedValue({ sent: true });
    await expect(sendContactForm(payload)).resolves.toEqual({ ok: true });
    expect(mocks.ack).toHaveBeenCalledOnce();
    expect(mocks.ack).toHaveBeenCalledWith({ to: "jane@example.com", purpose: "general" });
  });

  it("passes no free text from the submission into the acknowledgement", async () => {
    mocks.ack.mockResolvedValue({ sent: true });
    await sendContactForm({ ...payload, name: "<script>", message: "attacker copy" });
    const arg = mocks.ack.mock.calls[0][0];
    expect(Object.keys(arg).sort()).toEqual(["purpose", "to"]);
    expect(JSON.stringify(arg)).not.toContain("attacker copy");
    expect(JSON.stringify(arg)).not.toContain("<script>");
  });

  it("still succeeds when the acknowledgement fails", async () => {
    mocks.ack.mockResolvedValue({ sent: false, reason: "provider_error" });
    await expect(sendContactForm(payload)).resolves.toEqual({ ok: true });
  });

  it("still succeeds when the acknowledgement throws outright", async () => {
    mocks.ack.mockRejectedValue(new Error("network down"));
    await expect(sendContactForm(payload)).resolves.toEqual({ ok: true });
  });

  it("does not let the acknowledgement overwrite the internal email state", async () => {
    mocks.ack.mockResolvedValue({ sent: false, reason: "provider_error" });
    await sendContactForm(payload);
    // Two updates only: the internal notification state and the CRM state.
    expect(mocks.update).toHaveBeenCalledTimes(2);
    expect(mocks.update).toHaveBeenNthCalledWith(1, {
      where: { id: "submission-1" },
      data: { emailState: "SUCCEEDED", emailStateUpdatedAt: expect.any(Date), emailSentAt: expect.any(Date) },
    });
  });

  it("sends the acknowledgement after the enquiry is already recorded", async () => {
    mocks.ack.mockResolvedValue({ sent: true });
    await sendContactForm(payload);
    expect(mocks.create.mock.invocationCallOrder[0]).toBeLessThan(mocks.ack.mock.invocationCallOrder[0]);
    expect(mocks.email.mock.invocationCallOrder[0]).toBeLessThan(mocks.ack.mock.invocationCallOrder[0]);
  });
});
