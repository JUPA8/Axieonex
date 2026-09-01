import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found | Axieonex",
};

export default function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">404</p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">Page not found</h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-fg-muted)]">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. The live axieonex.com
          site has no custom 404 page for this case (see docs/CURRENT_SITE_AUDIT.md) — this one was
          added during reconstruction per your Phase 1 requirements.
        </p>
        <div className="mt-8">
          <Button href="/">Back to Home</Button>
        </div>
      </Container>
    </section>
  );
}
