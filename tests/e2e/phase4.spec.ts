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
