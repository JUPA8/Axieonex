"use client";

import { useRef, type ButtonHTMLAttributes, type MouseEvent as ReactMouseEvent } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "default" | "large";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: () => void;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-white bg-[image:var(--ax-gradient-spectral)] hover:brightness-110",
  secondary: "text-ax-text-primary border border-ax-border-default bg-transparent hover:border-ax-text-primary",
  ghost: "text-ax-text-primary bg-transparent hover:bg-white/5",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "px-6 py-3.5 text-sm",
  large: "px-[30px] py-[17px] text-sm",
};

const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm font-semibold tracking-wide transition-transform duration-200 ease-[var(--ax-ease-standard)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ax-focus-ring) disabled:cursor-not-allowed disabled:opacity-50";

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "default", magnetic = false, className, children } = props;
  const nodeRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);

  function handlePointerMove(event: ReactMouseEvent) {
    const node = nodeRef.current;
    if (!magnetic || reduced || !node) return;
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    node.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
  }

  function handlePointerLeave() {
    const node = nodeRef.current;
    if (node) node.style.transform = "translate(0, 0)";
  }

  if ("href" in props && props.href) {
    const { href, external, onClick } = props;
    if (external || !href.startsWith("/")) {
      return (
        <a
          href={href}
          className={classes}
          ref={nodeRef as React.Ref<HTMLAnchorElement>}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={onClick}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    }
    return (
      <TransitionLink
        href={href}
        className={classes}
        ref={nodeRef as React.Ref<HTMLAnchorElement>}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={onClick}
      >
        {children}
      </TransitionLink>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button
      {...buttonProps}
      className={classes}
      ref={nodeRef as React.Ref<HTMLButtonElement>}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </button>
  );
}
