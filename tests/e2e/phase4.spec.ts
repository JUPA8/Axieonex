import { createHmac, randomBytes } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.TEST_DATABASE_URL!;
const productionMode = process.env.E2E_SERVER_MODE === "production";
const webhookKey = "phase4-local-webhook-fixture-key";
const webhookUser = "https://api.calendly.com/users/phase4-local-user";
const publishedSlug = "phase4-published-article";
const draftSlug = "phase4-private-draft";

const publicRoutes = [
  "/",
  "/about",
  "/how-we-work",
  "/services",
  "/services/lead-generation",
  "/services/appointment-setting",
  "/services/hybrid-sdr",
  "/services/cold-email",
  "/services/linkedin-outreach",
  "/services/cold-calling",
  "/services/presales-gtm",
  "/pricing",
  "/contact",
  "/book-strategy-call",
  "/privacy",
  "/cookies",
  "/terms",
  "/cookie-preferences",
  "/insights",
  `/insights/${publishedSlug}`,
] as const;

const viewports = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "430x932", width: 430, height: 932 },
  { name: "390x844", width: 390, height: 844 },
  { name: "1366x768", width: 1366, height: 768 },
] as const;

let prisma: PrismaClient;
let adminPassword: string;
let adminId: string;

function captureUnexpectedBrowserFailures(page: Page) {
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText;
    const url = new URL(request.url());
    if (request.method() === "GET" && url.searchParams.has("_rsc") && failure === "net::ERR_ABORTED") return;
    failures.push(`requestfailed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
  });
  return failures;
}

async function dismissConsent(page: Page) {
  const necessaryOnly = page.getByRole("button", { name: /Necessary only|Reject optional/ });
  if (await necessaryOnly.isVisible().catch(() => false)) await necessaryOnly.click();
}

async function login(page: Page, password = adminPassword) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("phase4-admin@example.test");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function fillArticleForm(page: Page, slug: string, title: string) {
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Category").fill("Phase 4 QA");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Accent color (hex)").fill("#3E7BFA");
  await page.getByLabel("Intro paragraph").fill("A local-only integration test article.");
  await page.getByLabel("First subheading").fill("First finding");
  await page.getByLabel("First section body").fill("The first verified finding.");
  await page.getByLabel("Second subheading").fill("Second finding");
  await page.getByLabel("Second section body").fill("The second verified finding.");
  await page.getByLabel(/Closing paragraph/).fill("A verified local conclusion.");
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const parsed = new URL(databaseUrl);
  expect(["127.0.0.1", "localhost", "::1"]).toContain(parsed.hostname);
  expect(parsed.pathname).toMatch(/phase4|test/i);

  prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
  await prisma.consentRecord.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.article.deleteMany();
  await prisma.admin.deleteMany();

  adminPassword = randomBytes(24).toString("base64url");
  const admin = await prisma.admin.create({
    data: {
      email: "phase4-admin@example.test",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Phase 4 Admin",
    },
  });
  adminId = admin.id;

  await prisma.article.createMany({
    data: [
      {
        slug: publishedSlug,
        title: "Phase 4 Published Article",
        category: "Quality assurance",
        color: "#3E7BFA",
        intro: "Hostile JSON-LD fixture: </script><script>window.__xss = true</script>",
        h2a: "Executed evidence",
        bodyA: "This content exists only in the isolated Phase 4 database.",
        h2b: "Deployment boundary",
        bodyB: "No production service was contacted.",
        closing: "The fixture is removed after the browser suite.",
        published: true,
        publishedAt: new Date(),
      },
      {
        slug: draftSlug,
        title: "Phase 4 Private Draft",
        category: "Quality assurance",
        color: "#8B5CF6",
        intro: "This draft must never be indexed.",
        h2a: "Private",
        bodyA: "Draft content.",
        h2b: "Still private",
        bodyB: "Draft content.",
        closing: "Draft content.",
        published: false,
      },
    ],
  });
});

test.afterAll(async () => {
  if (!prisma) return;
  await prisma.consentRecord.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.article.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.$disconnect();
});

for (const viewport of viewports) {
  test(`all production routes render without overflow or browser failures at ${viewport.name}`, async ({ page }) => {
    // Twenty cold navigations against an on-demand dev compiler: this sweep
    // needs its own budget rather than the per-interaction default.
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const failures = captureUnexpectedBrowserFailures(page);

    for (const route of publicRoutes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1"), `${route} must have exactly one h1`).toHaveCount(1);
      await expect(page.locator("h1"), `${route} h1 must be visible`).toBeVisible();
      await dismissConsent(page);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
    }

    expect(failures).toEqual([]);
  });
}

test("keyboard navigation, skip link, mobile menu focus, Escape, and reduced motion work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const failures = captureUnexpectedBrowserFailures(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      "axieonex-cookie-consent",
      JSON.stringify({
        version: 1,
        categories: { necessary: true, functional: false, analytics: false, preferences: false, marketing: false },
        updatedAt: "2026-09-24T00:00:00.000Z",
      }),
    );
  });
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Skip to content" });
  const focusSequence: string[] = [];
  for (let index = 0; index < 20 && !(await skipLink.evaluate((element) => element === document.activeElement)); index += 1) {
    await page.keyboard.press("Tab");
    focusSequence.push(
      await page.evaluate(() => `${document.activeElement?.tagName}:${document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim().slice(0, 30) ?? ""}`),
    );
  }
  expect(await skipLink.evaluate((element) => element === document.activeElement), focusSequence.join(" -> ")).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const openMenu = page.getByRole("button", { name: "Open menu" });
  await openMenu.click();
  const mobileDialog = page.getByRole("dialog", { name: "Site navigation" });
  await expect(mobileDialog).toBeVisible();
  await expect(mobileDialog.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeHidden();
  await expect(openMenu).toBeFocused();

  await openMenu.click();
  await mobileDialog.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  expect(failures).toEqual([]);
});

test("automated accessibility scans pass on every production route", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const violations: string[] = [];
  for (const route of publicRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await dismissConsent(page);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    for (const violation of result.violations) {
      violations.push(`${route}: ${violation.id} (${violation.nodes.length}) ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`);
    }
  }
  expect(violations).toEqual([]);
});

test("SEO, JSON-LD, noindex, sitemap, robots, headers, CSP, and real 404 responses are correct", async ({ page, request }) => {
  await page.goto(`/insights/${publishedSlug}`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/insights/${publishedSlug}$`));
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Phase 4 Published Article/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
  const articleJsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(() => JSON.parse(articleJsonLd ?? "")).not.toThrow();
  expect(await page.evaluate(() => (window as typeof window & { __xss?: boolean }).__xss)).toBeUndefined();

  for (const route of ["/book-strategy-call", "/cookie-preferences", "/admin/login", `/insights/${draftSlug}`, "/does-not-exist"]) {
    const response = await page.goto(route);
    if (route.includes(draftSlug) || route === "/does-not-exist") expect(response?.status()).toBe(404);
    const robotsMeta = page.locator('meta[name="robots"]');
    expect(await robotsMeta.count()).toBeGreaterThan(0);
    expect(await robotsMeta.evaluateAll((elements) => elements.every((element) => element.getAttribute("content")?.includes("noindex")))).toBe(true);
  }

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain(`/insights/${publishedSlug}`);
  expect(sitemapBody).not.toContain(draftSlug);
  expect(sitemapBody).not.toContain("/admin");
  expect(sitemapBody).not.toContain("/book-strategy-call");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");

  const home = await request.get("/");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(home.headers()["permissions-policy"]).toContain("camera=()");
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(home.headers()["x-powered-by"]).toBeUndefined();
});

test("admin authentication and the complete article lifecycle use the isolated database", async ({ page, request }) => {
  test.skip(productionMode, "Production HTTP smoke cannot retain intentionally Secure auth cookies.");
  const protectedResponse = await page.goto("/admin/articles/new");
  expect(protectedResponse?.status()).toBe(200);
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.getByLabel("Email").fill("unknown@example.test");
  await page.getByLabel("Password").fill("incorrect password");
  await page.getByRole("button", { name: "Sign in" }).click();
  const genericAuthError = page.getByText("Invalid email or password.", { exact: true });
  await expect(genericAuthError).toBeVisible();

  await page.getByLabel("Email").fill("phase4-admin@example.test");
  await page.getByLabel("Password").fill("incorrect password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(genericAuthError).toHaveText("Invalid email or password.");

  await login(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Articles" }).click();
  await page.getByRole("link", { name: "New article" }).click();
  const lifecycleSlug = "phase4-browser-lifecycle";
  await fillArticleForm(page, lifecycleSlug, "Phase 4 Browser Draft");
  await page.getByRole("button", { name: "Create article" }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/);
  await expect(page.getByRole("row", { name: /Phase 4 Browser Draft/ })).toContainText("Draft");
  expect((await request.get(`/insights/${lifecycleSlug}`)).status()).toBe(404);

  const row = page.getByRole("row", { name: /Phase 4 Browser Draft/ });
  await row.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Title").fill("Phase 4 Browser Article Updated");
  await page.getByRole("button", { name: "Save changes" }).click();
  const updatedRow = page.getByRole("row", { name: /Phase 4 Browser Article Updated/ });
  await updatedRow.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("row", { name: /Phase 4 Browser Article Updated/ })).toContainText("Published");
  expect((await request.get(`/insights/${lifecycleSlug}`)).status()).toBe(200);

  await page.getByRole("row", { name: /Phase 4 Browser Article Updated/ }).getByRole("button", { name: "Unpublish" }).click();
  await expect(page.getByRole("row", { name: /Phase 4 Browser Article Updated/ })).toContainText("Draft");
  expect((await request.get(`/insights/${lifecycleSlug}`)).status()).toBe(404);
  await page.getByRole("row", { name: /Phase 4 Browser Article Updated/ }).getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Phase 4 Browser Article Updated")).toHaveCount(0);
  expect(await prisma.article.findUnique({ where: { slug: lifecycleSlug } })).toBeNull();

  await prisma.admin.update({ where: { id: adminId }, data: { active: false } });
  await page.goto("/admin/articles");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await prisma.admin.update({ where: { id: adminId }, data: { active: true } });
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("contact form validates, focuses errors, and persists despite absent optional providers", async ({ page }) => {
  test.skip(productionMode, "Production anti-abuse correctly fails closed without live credentials.");
  await page.goto("/contact");
  await dismissConsent(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("What is this about?")).toBeFocused();
  await expect(page.getByLabel("What is this about?")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Company (optional)")).toHaveAttribute("aria-invalid", "false");

  await page.getByLabel("What is this about?").selectOption("service");
  await page.getByLabel("Full name").fill("Phase Four Contact");
  await page.getByLabel("Business email").fill("phase4-contact@example.test");
  await page.getByLabel("Company (optional)").fill("Local QA");
  await page.getByLabel("Message").fill("This submission must remain in the disposable database only.");
  await page.getByRole("checkbox", { name: /I agree to be contacted/ }).check();
  await page.getByRole("button", { name: "Send message" }).press("Enter");
  await expect(page.getByRole("heading", { name: "Message sent." })).toBeVisible();

  const stored = await prisma.contactSubmission.findFirst({ where: { email: "phase4-contact@example.test" } });
  expect(stored).toMatchObject({ purpose: "service", name: "Phase Four Contact", emailSentAt: null, crmSyncedAt: null });
});

test("booking browser lifecycle stays pending until a valid signed webhook and is idempotent", async ({ page, request }) => {
  test.skip(productionMode, "Production anti-abuse correctly fails closed without live credentials.");
  await page.route("https://assets.calendly.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "/* isolated Calendly boundary */" }),
  );
  await page.goto("/book-strategy-call");
  await dismissConsent(page);
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByLabel("Full name")).toBeFocused();
  await page.getByLabel("Full name").fill("Phase Four Booking");
  await page.getByLabel("Business email").fill("phase4-booking@example.test");
  await page.getByLabel("Phone number").fill("+49 30 555 0100");
  await page.getByLabel("Role").fill("Founder");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Phase Four Booking");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Company name").fill("Local QA");
  await page.getByLabel("Company website").fill("local.test");
  await page.getByLabel("Country").fill("Germany");
  await page.getByLabel("Company size").selectOption("11-50");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Current outbound approach").fill("Human-led local testing");
  await page.getByLabel("Desired outcome").fill("Verified production readiness");
  await page.getByLabel("Target market").fill("Europe");
  await page.getByLabel("Monthly engagement range").selectOption("3k-8k");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("checkbox", { name: /I agree to be contacted/ }).check();
  await page.getByRole("button", { name: "Continue to scheduling" }).click();
  await expect(page.getByRole("heading", { name: "Select a date and time" })).toBeVisible();

  const pending = await prisma.bookingRequest.findFirstOrThrow({ where: { email: "phase4-booking@example.test" } });
  expect(pending.status).toBe("PENDING");
  expect(pending.calendarInviteeUid).toBeNull();

  await page.evaluate(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://calendly.com",
        data: {
          event: "calendly.event_scheduled",
          payload: {
            event: { uri: "https://api.calendly.com/scheduled_events/client-controlled" },
            invitee: { uri: "https://api.calendly.com/scheduled_events/client-controlled/invitees/client-controlled" },
          },
        },
      }),
    );
  });
  await expect(page.getByRole("heading", { name: "Calendly is confirming your call." })).toBeVisible();
  expect((await prisma.bookingRequest.findUniqueOrThrow({ where: { id: pending.id } })).status).toBe("PENDING");

  const eventUri = "https://api.calendly.com/scheduled_events/phase4-event";
  const inviteeUri = `${eventUri}/invitees/phase4-invitee`;
  const body = JSON.stringify({
    event: "invitee.created",
    created_by: webhookUser,
    payload: {
      event: eventUri,
      uri: inviteeUri,
      email: "phase4-booking@example.test",
      tracking: { utm_content: pending.calendarCorrelationId },
      scheduled_event: { start_time: "2026-10-01T09:00:00Z" },
    },
  });
  const signature = (timestamp: number) =>
    `t=${timestamp},v1=${createHmac("sha256", webhookKey).update(`${timestamp}.${body}`).digest("hex")}`;
  expect((await request.post("/api/webhooks/calendly", { data: body, headers: { "content-type": "application/json" } })).status()).toBe(401);
  expect(
    (
      await request.post("/api/webhooks/calendly", {
        data: body,
        headers: {
          "content-type": "application/json",
          "Calendly-Webhook-Signature": signature(Math.floor(Date.now() / 1000) - 181),
        },
      })
    ).status(),
  ).toBe(401);

  const now = Math.floor(Date.now() / 1000);
  const headers = { "content-type": "application/json", "Calendly-Webhook-Signature": signature(now) };
  const [firstDelivery, concurrentReplay] = await Promise.all([
    request.post("/api/webhooks/calendly", { data: body, headers }),
    request.post("/api/webhooks/calendly", { data: body, headers }),
  ]);
  expect([firstDelivery.status(), concurrentReplay.status()]).toEqual([200, 200]);
  expect((await request.post("/api/webhooks/calendly", { data: body, headers })).status()).toBe(200);

  const confirmed = await prisma.bookingRequest.findUniqueOrThrow({ where: { id: pending.id } });
  expect(confirmed).toMatchObject({ status: "CONFIRMED", calendarInviteeUid: inviteeUri, emailSentAt: null, crmSyncedAt: null });
  await page.getByRole("button", { name: "Check confirmation" }).click();
  await expect(page.getByRole("heading", { name: "Call booked." })).toBeVisible();
});

test("admin data pages are protected, truthful, paginated, persistent, accessible, and responsive", async ({ page }) => {
  test.skip(productionMode, "Production HTTP smoke cannot retain intentionally Secure auth cookies.");
  test.setTimeout(60_000);
  const failures = captureUnexpectedBrowserFailures(page);

  const contact = await prisma.contactSubmission.create({
    data: {
      purpose: "admin operational verification",
      name: "Hostile <script>window.__adminContactXss = true</script>",
      email: "an-intentionally-long-contact-address-for-mobile-containment@example.test",
      company: "Local synthetic QA company with a deliberately long name",
      message: "First line\n</p><script>window.__adminContactXss = true</script>\nLast line with averylongunbrokentokenforresponsivecontainmenttesting",
      ipAddress: "198.51.100.42-sensitive-sentinel",
      emailState: "FAILED",
      emailStateUpdatedAt: new Date("2026-09-25T10:01:00.000Z"),
      crmState: "DISABLED",
      crmStateUpdatedAt: new Date("2026-09-25T10:02:00.000Z"),
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 5));
  const updatedContact = await prisma.contactSubmission.update({
    where: { id: contact.id },
    data: { message: `${contact.message}\nUpdated safely.` },
  });
  expect(updatedContact.updatedAt.getTime()).toBeGreaterThan(contact.createdAt.getTime());

  const booking = await prisma.bookingRequest.create({
    data: {
      name: "Hostile <img src=x onerror=window.__adminBookingXss=true>",
      email: "an-intentionally-long-booking-address-for-mobile-containment@example.test",
      phone: "+49 30 555 0199",
      role: "Founder",
      company: "Local synthetic QA booking company with a deliberately long name",
      website: "https://local.test/<script>unsafe</script>",
      country: "Germany",
      size: "11-50",
      approach: "Synthetic local testing only",
      outcome: "Verify protected operational details",
      market: "Europe",
      budget: "3k-8k",
      slotId: "2026-10-02T09:00:00Z",
      slotLabel: "2 October 2026 at 09:00 UTC",
      status: "CONFIRMED",
      calendarCorrelationId: "axieonex_e2e-sensitive-correlation-sentinel",
      calendarInviteeUid: "https://api.calendly.com/invitees/e2e-sensitive-invitee-sentinel",
      calendarBookingUid: "https://api.calendly.com/events/e2e-operational-reference",
      confirmedAt: new Date("2026-09-25T10:03:00.000Z"),
      ipAddress: "198.51.100.43-sensitive-sentinel",
      emailState: "SUCCEEDED",
      emailStateUpdatedAt: new Date("2026-09-25T10:04:00.000Z"),
      emailSentAt: new Date("2026-09-25T10:04:00.000Z"),
      crmState: "LEGACY_UNKNOWN",
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 5));
  const updatedBooking = await prisma.bookingRequest.update({
    where: { id: booking.id },
    data: { outcome: "Verify protected operational details after update" },
  });
  expect(updatedBooking.updatedAt.getTime()).toBeGreaterThan(booking.createdAt.getTime());

  await prisma.contactSubmission.createMany({
    data: Array.from({ length: 21 }, (_, index) => ({
      purpose: "pagination",
      name: `Contact page fixture ${String(index).padStart(2, "0")}`,
      email: `contact-page-${index}@example.test`,
      message: "Disposable pagination fixture",
      ipAddress: "unknown",
    })),
  });
  await prisma.bookingRequest.createMany({
    data: Array.from({ length: 21 }, (_, index) => ({
      name: `Booking page fixture ${String(index).padStart(2, "0")}`,
      email: `booking-page-${index}@example.test`,
      phone: "+49 30 555 0100",
      role: "QA",
      company: "Local QA",
      website: "local.test",
      country: "Germany",
      size: "1-10",
      approach: "Synthetic testing",
      outcome: "Pagination verification",
      market: "Europe",
      budget: "3k-8k",
      slotId: "pending-calendly-webhook",
      slotLabel: "Pending Calendly confirmation",
      status: "PENDING",
      ipAddress: "unknown",
    })),
  });

  for (const route of [
    `/admin/contacts/${contact.id}`,
    `/admin/bookings/${booking.id}`,
    `/admin/articles/${publishedSlug}`,
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }

  await login(page);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("navigation", { name: "Contact submissions pagination" })).toContainText(/Page 1 of 2/);
  await expect(page.getByRole("navigation", { name: "Strategy call requests pagination" })).toContainText(/Page 1 of 2/);

  const contactNext = page.getByRole("navigation", { name: "Contact submissions pagination" }).getByRole("link", { name: "Next" });
  await contactNext.focus();
  await expect(contactNext).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/contactsPage=2/);
  await expect(page.getByRole("navigation", { name: "Contact submissions pagination" })).toContainText(/Page 2 of 2/);
  await expect(page.getByRole("navigation", { name: "Strategy call requests pagination" })).toContainText(/Page 1 of 2/);

  await page.goto(`/admin/contacts/${contact.id}?contactsPage=2&bookingsPage=1`);
  await expect(page.getByRole("heading", { level: 1, name: "Contact submission" })).toBeVisible();
  await expect(page.getByText("Failed", { exact: true })).toBeVisible();
  await expect(page.getByText("Disabled / not configured", { exact: true })).toBeVisible();
  await expect(page.getByText(/Updated safely/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to submissions" })).toHaveAttribute("href", "/admin?contactsPage=2");
  expect(await page.evaluate(() => (window as typeof window & { __adminContactXss?: boolean }).__adminContactXss)).toBeUndefined();
  expect(await page.locator("body").innerText()).not.toContain("198.51.100.42-sensitive-sentinel");
  expect(await page.locator("body").innerText()).not.toContain("emailStateUpdatedAt");
  await expect(page.locator("h1")).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  await page.goto("/admin?contactsPage=2&bookingsPage=2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const tableScrollers = page.locator("div.overflow-x-auto");
  await expect(tableScrollers).toHaveCount(2);
  for (const scroller of await tableScrollers.all()) {
    expect(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  }

  await page.goto(`/admin/bookings/${booking.id}`);
  await expect(page.getByRole("heading", { level: 1, name: "Strategy call request" })).toBeVisible();
  await expect(page.getByText("CONFIRMED", { exact: true })).toBeVisible();
  await expect(page.getByText("Confirmed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Succeeded", { exact: true })).toBeVisible();
  await expect(page.getByText("Legacy / unknown", { exact: true })).toBeVisible();
  const bookingBody = await page.locator("body").innerText();
  expect(bookingBody).not.toContain("e2e-sensitive-correlation-sentinel");
  expect(bookingBody).not.toContain("e2e-sensitive-invitee-sentinel");
  expect(bookingBody).not.toContain("198.51.100.43-sensitive-sentinel");
  expect(await page.evaluate(() => (window as typeof window & { __adminBookingXss?: boolean }).__adminBookingXss)).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const detailAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(detailAxe.violations).toEqual([]);

  const refreshedRecord = await prisma.contactSubmission.create({
    data: {
      purpose: "session refresh verification",
      name: "Created after initial dashboard load",
      email: "new-session-record@example.test",
      message: "Visible after refresh and a new authenticated session.",
      ipAddress: "unknown",
    },
  });
  await page.goto("/admin");
  await page.reload();
  await expect(page.getByText(refreshedRecord.email)).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await login(page);
  await expect(page.getByText(refreshedRecord.email)).toBeVisible();

  await prisma.admin.update({ where: { id: adminId }, data: { active: false } });
  await page.goto(`/admin/contacts/${contact.id}`);
  await expect(page).toHaveURL(/\/admin\/login$/);
  await prisma.admin.update({ where: { id: adminId }, data: { active: true } });
  await prisma.admin.delete({ where: { id: adminId } });
  await page.goto(`/admin/bookings/${booking.id}`);
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(failures).toEqual([]);
});

/**
 * The pinned three-stage sequence. The rest of this suite runs with reduced
 * motion, which deliberately renders the plain fallback, so the scroll-bound
 * path needs its own coverage: that it pins, that the copy advances, that it
 * releases, and that nothing about it traps scroll or breaks history.
 */
const STICKY_BEATS = ["Detection", "Orchestration", "Qualified conversation"] as const;

async function seedConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "axieonex-cookie-consent",
      JSON.stringify({
        version: 1,
        categories: { necessary: true, functional: false, analytics: false, preferences: false, marketing: false },
        updatedAt: "2026-09-24T00:00:00.000Z",
      }),
    );
  });
}

/** Scrolls to an absolute offset the way a wheel does: in steps, across frames. */
async function scrollTo(page: Page, target: number, steps = 14) {
  await page.evaluate(
    async ([to, count]) => {
      const from = window.scrollY;
      const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      for (let i = 1; i <= count; i += 1) {
        window.scrollTo(0, from + ((to - from) * i) / count);
        await frame();
      }
    },
    [target, steps] as const,
  );
  await page.waitForTimeout(900);
}

async function pinGeometry(page: Page) {
  return page.evaluate(() => {
    const track = document.querySelector<HTMLElement>('[data-sticky-narrative="pinned"]');
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    return { top: rect.top + window.scrollY, height: rect.height, viewport: window.innerHeight };
  });
}

test("the pinned narrative holds the viewport, advances all three beats, and releases cleanly", async ({ page }) => {
  test.setTimeout(120_000);
  await seedConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const failures = captureUnexpectedBrowserFailures(page);

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForSelector('[data-sticky-narrative="pinned"]');

  const geometry = await pinGeometry(page);
  expect(geometry).not.toBeNull();
  const { top, height, viewport } = geometry!;
  const pin = height - viewport;
  // Enough distance for three beats, but not an endless scroll trap.
  expect(pin).toBeGreaterThan(viewport * 1.5);
  expect(pin).toBeLessThan(viewport * 3.2);

  const seen: string[] = [];
  const stage = page.locator('[data-sticky-narrative="pinned"] .ax-pin-sticky');

  for (const fraction of [0.04, 0.2, 0.45, 0.7, 0.88, 0.99]) {
    await scrollTo(page, Math.round(top + pin * fraction));

    // The stage stays pinned to the top of the viewport for the whole run.
    const box = await stage.boundingBox();
    expect(box, `stage must be on screen at ${fraction}`).not.toBeNull();
    expect(Math.abs(box!.y), `stage must stay pinned at ${fraction}`).toBeLessThanOrEqual(2);

    const current = await page.locator('.ax-pin-beat[data-state="current"] h2').innerText();
    expect(current.length, `a beat must be showing at ${fraction}`).toBeGreaterThan(0);
    if (seen[seen.length - 1] !== current) seen.push(current);

    // The environment never blanks out mid-sequence.
    const painted = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      return canvas ? canvas.width > 0 && canvas.height > 0 : false;
    });
    expect(painted, `canvas must stay live at ${fraction}`).toBe(true);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${fraction}`).toBeLessThanOrEqual(1);
  }

  // Every beat appeared, in order, with no repeats or restarts.
  expect(seen).toEqual([...STICKY_BEATS]);

  // The pin releases: past the track, the stage is gone and the page keeps scrolling.
  await scrollTo(page, Math.round(top + height + viewport * 0.5));
  const releasedBox = await stage.boundingBox();
  expect(releasedBox === null || releasedBox.y < 0).toBe(true);

  const beforeEnd = await page.evaluate(() => window.scrollY);
  await scrollTo(page, 10_000_000);
  const atEnd = await page.evaluate(() => ({
    y: window.scrollY,
    max: document.documentElement.scrollHeight - window.innerHeight,
  }));
  expect(atEnd.y).toBeGreaterThan(beforeEnd);
  // Scroll is never captured: the document bottom is reachable.
  expect(Math.abs(atEnd.y - atEnd.max)).toBeLessThanOrEqual(2);
  await expect(page.getByRole("link", { name: "Book a strategy call" }).first()).toBeVisible();

  expect(failures).toEqual([]);
});

test("the pinned narrative leaves history and direct routes alone", async ({ page }) => {
  await seedConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto("/", { waitUntil: "networkidle" });
  const geometry = await pinGeometry(page);
  await scrollTo(page, Math.round(geometry!.top + (geometry!.height - geometry!.viewport) * 0.5));
  const entriesAfterScrolling = await page.evaluate(() => history.length);

  await page.goto("/pricing", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goBack({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/$/);
  await page.waitForSelector('[data-sticky-narrative="pinned"]');
  await page.goForward({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/pricing$/);

  // Scrolling the pin must not have pushed history entries of its own.
  expect(entriesAfterScrolling).toBeLessThanOrEqual(2);
});

test("reduced motion replaces the pin with three plain, fully readable stages", async ({ page }) => {
  await seedConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('[data-sticky-narrative="static"]')).toBeAttached();
  await expect(page.locator('[data-sticky-narrative="pinned"]')).toHaveCount(0);

  const items = page.locator('[data-sticky-narrative="static"] > li');
  await expect(items).toHaveCount(3);
  for (const beat of STICKY_BEATS) {
    const heading = page.getByRole("heading", { name: beat, exact: true });
    await expect(heading).toBeVisible();
  }
});

test("the pinned homepage passes an accessibility scan with motion enabled", async ({ page }) => {
  test.setTimeout(120_000);
  await seedConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForSelector('[data-sticky-narrative="pinned"]');

  const geometry = await pinGeometry(page);
  const pin = geometry!.height - geometry!.viewport;
  for (const fraction of [0.1, 0.5, 0.9]) {
    await scrollTo(page, Math.round(geometry!.top + pin * fraction));
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const violations = result.violations.map(
      (violation) => `${fraction}: ${violation.id} ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
    );
    expect(violations).toEqual([]);
  }
});

test("the pinned run is shorter on a phone than on a desktop", async ({ page }) => {
  await seedConsent(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForSelector('[data-sticky-narrative="pinned"]');
  const desktop = await pinGeometry(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForSelector('[data-sticky-narrative="pinned"]');
  const mobile = await pinGeometry(page);

  const ratio = (g: NonNullable<Awaited<ReturnType<typeof pinGeometry>>>) => g.height / g.viewport;
  expect(ratio(mobile!)).toBeLessThan(ratio(desktop!));
  // Still long enough for three beats to land.
  expect(ratio(mobile!)).toBeGreaterThan(2);

  const current = await page.locator('.ax-pin-beat[data-state="current"] h2').innerText();
  expect(current).toBe("Detection");
});
