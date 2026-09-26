import { beforeEach, describe, expect, it, vi } from "vitest";

const VALID_ID = "c123456789012345678901234";
const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  transaction: vi.fn(),
  contactCount: vi.fn(),
  contactMany: vi.fn(),
  contactOne: vi.fn(),
  bookingCount: vi.fn(),
  bookingMany: vi.fn(),
  bookingOne: vi.fn(),
  articles: vi.fn(),
  article: vi.fn(),
}));

const transactionClient = {
  contactSubmission: { count: mocks.contactCount, findMany: mocks.contactMany },
  bookingRequest: { count: mocks.bookingCount, findMany: mocks.bookingMany },
};

vi.mock("@/lib/adminAuthorization", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    contactSubmission: { findUnique: mocks.contactOne },
    bookingRequest: { findUnique: mocks.bookingOne },
    article: { findMany: mocks.articles, findUnique: mocks.article },
  },
}));

import { getAdminArticle, getAdminArticles, getAdminBooking, getAdminContact, getAdminSubmissions } from "@/lib/adminData";

describe("admin sensitive reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1", email: "admin@example.test" });
    mocks.transaction.mockImplementation(async (callback: (client: typeof transactionClient) => unknown) => callback(transactionClient));
    mocks.contactCount.mockResolvedValue(0);
    mocks.bookingCount.mockResolvedValue(0);
    mocks.contactMany.mockResolvedValue([]);
    mocks.bookingMany.mockResolvedValue([]);
  });

  it.each([
    ["submissions", () => getAdminSubmissions()],
    ["contact", () => getAdminContact(VALID_ID)],
    ["booking", () => getAdminBooking(VALID_ID)],
    ["articles", () => getAdminArticles()],
    ["article", () => getAdminArticle("article-1")],
  ])("blocks %s before querying", async (_name, invoke) => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("Not authorized."));
    await expect(invoke()).rejects.toThrow("Not authorized.");
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.contactOne).not.toHaveBeenCalled();
    expect(mocks.bookingOne).not.toHaveBeenCalled();
    expect(mocks.articles).not.toHaveBeenCalled();
    expect(mocks.article).not.toHaveBeenCalled();
  });

  it("uses bounded pages and stable deterministic ordering", async () => {
    mocks.contactCount.mockResolvedValue(45);
    mocks.bookingCount.mockResolvedValue(21);
    await getAdminSubmissions(2, 999);

    expect(mocks.contactMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: 20,
      take: 20,
    }));
    expect(mocks.bookingMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: 20,
      take: 20,
    }));
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "RepeatableRead" });
  });

  it("validates identifiers after authorization and before database access", async () => {
    await expect(getAdminContact("../../unsafe")).resolves.toBeNull();
    await expect(getAdminBooking("not-valid")).resolves.toBeNull();
    expect(mocks.requireAdmin).toHaveBeenCalledTimes(2);
    expect(mocks.contactOne).not.toHaveBeenCalled();
    expect(mocks.bookingOne).not.toHaveBeenCalled();
  });

  it("returns operational contact details without selecting the IP address", async () => {
    mocks.contactOne.mockResolvedValue({ name: "Contact", email: "contact@example.test" });
    await expect(getAdminContact(VALID_ID)).resolves.toMatchObject({ name: "Contact" });
    const query = mocks.contactOne.mock.calls[0][0];
    expect(query.select.ipAddress).toBeUndefined();
    expect(query.select.passwordHash).toBeUndefined();
  });

  it("removes raw Calendly correlation and invitee identifiers from booking results", async () => {
    mocks.bookingOne.mockResolvedValue({
      name: "Booking",
      calendarCorrelationId: "sensitive-correlation",
      calendarInviteeUid: "sensitive-invitee",
    });
    const result = await getAdminBooking(VALID_ID);
    expect(result).toMatchObject({ name: "Booking", hasCalendarCorrelation: true, hasCalendarInvitee: true });
    expect(result).not.toHaveProperty("calendarCorrelationId");
    expect(result).not.toHaveProperty("calendarInviteeUid");
    expect(mocks.bookingOne.mock.calls[0][0].select.ipAddress).toBeUndefined();
  });
});
