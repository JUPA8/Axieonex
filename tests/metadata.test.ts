import { describe, expect, it, vi } from "vitest";

const articleMocks = vi.hoisted(() => ({ getBySlug: vi.fn() }));
vi.mock("@/lib/articles", () => ({ getPublishedArticleBySlug: articleMocks.getBySlug }));
vi.mock("@/lib/adminData", () => ({ getAdminSubmissions: vi.fn() }));
vi.mock("@/auth", () => ({ auth: vi.fn(), signIn: vi.fn() }));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));

import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as privacyMetadata } from "@/app/privacy/page";
import { metadata as bookingMetadata } from "@/app/book-strategy-call/page";
import { metadata as preferencesMetadata } from "@/app/cookie-preferences/page";
import { metadata as adminMetadata } from "@/app/admin/(dashboard)/page";
import { metadata as loginMetadata } from "@/app/admin/(auth)/login/page";
import { metadata as notFoundMetadata } from "@/app/not-found";
import { generateMetadata as serviceMetadata } from "@/app/services/[slug]/page";
import { generateMetadata as articleMetadata } from "@/app/insights/[slug]/page";
import robots from "@/app/robots";

describe("route metadata", () => {
  it("gives indexable static pages canonical, Open Graph, and Twitter metadata", () => {
    for (const metadata of [aboutMetadata, privacyMetadata]) {
      expect(metadata.alternates?.canonical).toBeTruthy();
      expect(metadata.openGraph).toEqual(expect.objectContaining({ title: expect.any(String), description: expect.any(String), url: expect.any(String) }));
      expect(metadata.twitter).toEqual(expect.objectContaining({ card: "summary_large_image", title: expect.any(String), description: expect.any(String) }));
    }
  });

  it("puts the 1200x630 preview card on every public route, not just the home segment", async () => {
    const service = await serviceMetadata({ params: Promise.resolve({ slug: "lead-generation" }) });
    const card = expect.arrayContaining([
      expect.objectContaining({ url: expect.stringMatching(/image\.png$/), width: 1200, height: 630, alt: expect.any(String) }),
    ]);
    for (const metadata of [aboutMetadata, privacyMetadata, service]) {
      // An opengraph-image file only attaches to its own segment, and these
      // routes each export their own openGraph, so the image has to be named.
      expect(metadata.openGraph).toEqual(expect.objectContaining({ images: card }));
      expect(metadata.twitter).toEqual(expect.objectContaining({ images: card }));
    }
  });

  it("builds canonical social metadata for service and published article routes", async () => {
    const service = await serviceMetadata({ params: Promise.resolve({ slug: "lead-generation" }) });
    expect(service.openGraph).toEqual(expect.objectContaining({ url: expect.stringMatching(/\/services\/lead-generation$/) }));
    expect(service.twitter).toEqual(expect.objectContaining({ card: "summary_large_image" }));

    articleMocks.getBySlug.mockResolvedValue({ title: "Approved title", intro: "Approved intro" });
    const article = await articleMetadata({ params: Promise.resolve({ slug: "approved-article" }) });
    expect(article.openGraph).toEqual(expect.objectContaining({ type: "article", url: expect.stringMatching(/\/insights\/approved-article$/) }));
    expect(article.twitter).toEqual(expect.objectContaining({ title: "Approved title | AXIEONEX Insights" }));
  });

  it("marks unavailable, draft, and unknown dynamic content noindex", async () => {
    articleMocks.getBySlug.mockResolvedValue(null);
    await expect(articleMetadata({ params: Promise.resolve({ slug: "draft-or-missing" }) })).resolves.toEqual({ robots: { index: false, follow: false } });
    await expect(serviceMetadata({ params: Promise.resolve({ slug: "missing" }) })).resolves.toEqual({ robots: { index: false, follow: false } });
  });

  it("preserves noindex for private, utility, booking, and not-found routes", () => {
    for (const metadata of [bookingMetadata, preferencesMetadata, adminMetadata, loginMetadata, notFoundMetadata]) {
      expect(metadata.robots).toEqual(expect.objectContaining({ index: false }));
    }
  });

  it("keeps the public site crawlable with a canonical sitemap", () => {
    const value = robots();
    expect(value.rules).toEqual([{ userAgent: "*", allow: "/" }]);
    expect(value.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
