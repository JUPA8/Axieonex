import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3101";
const databaseUrl = process.env.TEST_DATABASE_URL;
const externalServer = process.env.E2E_EXTERNAL_SERVER === "1";

if (!databaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for browser tests.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
if (!["127.0.0.1", "localhost", "::1"].includes(parsedDatabaseUrl.hostname)) {
  throw new Error("Browser tests require a loopback-only PostgreSQL database.");
}
if (!/(phase4|test)/i.test(parsedDatabaseUrl.pathname)) {
  throw new Error("Browser tests require an explicitly named disposable test database.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["line"]],
  outputDir: "test-results",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    channel: "chromium",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: externalServer
    ? undefined
    : {
        command: "pnpm exec next dev --webpack -H 127.0.0.1 -p 3101",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          DATABASE_URL: databaseUrl,
          AUTH_SECRET: randomBytes(32).toString("hex"),
          NEXT_PUBLIC_SITE_URL: baseURL,
          NEXT_PUBLIC_CALENDLY_URL: "https://calendly.com/phase4-isolated/strategy-call",
          CALENDLY_WEBHOOK_SIGNING_KEY: "phase4-local-webhook-fixture-key",
          CALENDLY_WEBHOOK_USER_URI: "https://api.calendly.com/users/phase4-local-user",
          EMAIL_PROVIDER_API_KEY: "",
          EMAIL_FROM_ADDRESS: "",
          CRM_API_KEY: "",
          CRM_WORKSPACE_ID: "",
          CAPTCHA_SITE_KEY: "",
          CAPTCHA_SECRET: "",
          UPSTASH_REDIS_REST_URL: "",
          UPSTASH_REDIS_REST_TOKEN: "",
          TRUSTED_PROXY_IP_HEADER: "",
          ANALYTICS_PROVIDER_ID: "",
          ERROR_MONITORING_DSN: "",
        },
      },
});
