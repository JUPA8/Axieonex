"use client";

import { Button } from "@/components/ui/Button";
import { useDemoModal } from "./DemoModalContext";

export function DemoCtaButton({
  children,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}) {
  const { open } = useDemoModal();
  return (
    <Button variant={variant} className={className} onClick={open} type="button">
      {children}
    </Button>
  );
}
