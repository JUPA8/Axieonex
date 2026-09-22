import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/consent/route";

// Matches the project convention (see articles-db.test.ts, booking-actions.test.ts):
// the vitest environment has no DATABASE_URL and no Next.js request scope, so
// these exercise the routes' graceful-degradation paths rather than mocking
// prisma/next-headers to simulate a real request.

describe("GET /api/consent", () => {
  it("fails closed to no record rather than throwing, with no request scope or database available", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = (await response.json()) as { record: unknown };
    expect(body.record).toBeNull();
  });
});

describe("POST /api/consent", () => {
  it("rejects a request with an invalid JSON body", async () => {
    const request = new Request("http://localhost/api/consent", {
      method: "POST",
      body: "not json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("reports failure rather than a fake success when there is no request scope or database", async () => {
    const request = new Request("http://localhost/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: { necessary: true, functional: false, analytics: true, preferences: false, marketing: false } }),
    });
    const response = await POST(request);
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  it("rejects unexpected fields, malformed category types, and oversized bodies", async () => {
    const unexpected = await POST(new Request("http://localhost/api/consent", { method: "POST", body: JSON.stringify({ categories: { necessary: true, functional: false, analytics: false, preferences: false, marketing: false }, admin: true }) }));
    expect(unexpected.status).toBe(400);
    const malformed = await POST(new Request("http://localhost/api/consent", { method: "POST", body: JSON.stringify({ categories: { necessary: true, functional: "yes", analytics: false, preferences: false, marketing: false } }) }));
    expect(malformed.status).toBe(400);
    const oversized = await POST(new Request("http://localhost/api/consent", { method: "POST", body: "x".repeat(16 * 1024 + 1) }));
    expect(oversized.status).toBe(413);
  });
});
