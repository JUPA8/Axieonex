import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[#04141a] hover:bg-[var(--color-accent-strong)] shadow-[0_0_24px_rgba(53,215,232,0.35)]",
  outline:
    "border border-[var(--color-accent)]/60 text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]",
  ghost: "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: undefined;
}

interface ButtonAsLink extends CommonProps {
  href: string;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", className, children } = props;
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = { ...(props as ButtonAsButton) };
  delete (buttonProps as Partial<ButtonAsButton>).variant;
  delete (buttonProps as Partial<ButtonAsButton>).className;
  delete (buttonProps as Partial<ButtonAsButton>).children;
  return (
    <button {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
