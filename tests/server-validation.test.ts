import { describe, expect, it } from "vitest";
import { parseArticleForm, parseAuthCredentials, parseBookingData, parseConsentBody, parseContactForm } from "@/lib/serverValidation";

const booking = { name: " Jane Doe ", email: " JANE@example.com ", phone: "+1 555 0100", role: "CEO", company: "Acme", website: "acme.com", country: "US", size: "1-10", approach: "Cold email", outcome: "Growth", market: "North America", budget: "3k-8k", consent: true };

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("server validation", () => {
  it("normalizes valid booking data and rejects invalid enums, oversized values, and unexpected fields", () => {
    expect(parseBookingData(booking)).toEqual(expect.objectContaining({ ok: true, data: expect.objectContaining({ name: "Jane Doe", email: "jane@example.com" }) }));
    expect(parseBookingData({ ...booking, size: "10000+" }).ok).toBe(false);
    expect(parseBookingData({ ...booking, budget: "free" }).ok).toBe(false);
    expect(parseBookingData({ ...booking, name: "x".repeat(101) }).ok).toBe(false);
    expect(parseBookingData({ ...booking, admin: true }).ok).toBe(false);
  });

  it("rejects unsupported contact purposes, malformed emails, boundaries, and unexpected fields", () => {
    const valid = { purpose: "general", name: "Jane", email: "jane@example.com", company: "", message: "Hello", consent: "on" };
    expect(parseContactForm(form(valid)).ok).toBe(true);
    expect(parseContactForm(form({ ...valid, message: "x".repeat(5_000) })).ok).toBe(true);
    expect(parseContactForm(form({ ...valid, purpose: "unsupported" })).ok).toBe(false);
    expect(parseContactForm(form({ ...valid, email: "bad" })).ok).toBe(false);
    expect(parseContactForm(form({ purpose: "general", name: "Jane", company: "", message: "Hello", consent: "on" })).ok).toBe(false);
    expect(parseContactForm(form({ ...valid, message: "x".repeat(5_001) })).ok).toBe(false);
    expect(parseContactForm(form({ ...valid, privilege: "admin" })).ok).toBe(false);
  });

  it("validates authentication and CMS boundaries", () => {
    expect(parseAuthCredentials({ email: " ADMIN@example.com ", password: "long-enough" })).toEqual({ email: "admin@example.com", password: "long-enough" });
    expect(parseAuthCredentials({ email: "bad", password: "long-enough" })).toBeNull();
    const article = form({ slug: "safe-slug", title: "Title", category: "News", color: "#123456", intro: "Intro", h2a: "A", bodyA: "Body", h2b: "B", bodyB: "Body", closing: "Close" });
    expect(parseArticleForm(article).ok).toBe(true);
    article.set("bodyA", "x".repeat(20_000));
    expect(parseArticleForm(article).ok).toBe(true);
    article.set("bodyA", "x".repeat(20_001));
    expect(parseArticleForm(article).ok).toBe(false);
  });

  it("requires exact boolean consent categories without unexpected keys", () => {
    const valid = { categories: { necessary: true, functional: false, analytics: true, preferences: false, marketing: false } };
    expect(parseConsentBody(valid)).not.toBeNull();
    expect(parseConsentBody({ categories: { ...valid.categories, analytics: "yes" } })).toBeNull();
    expect(parseConsentBody({ ...valid, admin: true })).toBeNull();
  });
});
