import { Container } from "@/components/ui/Container";
import { DemoCtaButton } from "@/features/contact/DemoCtaButton";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <Navigation />
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <DemoCtaButton className="px-5 py-2.5 text-xs">Book a Strategy Call</DemoCtaButton>
          </div>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
