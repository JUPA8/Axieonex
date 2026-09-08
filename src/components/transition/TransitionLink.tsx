"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { useTransitionNavigate } from "@/components/transition/PageTransitionProvider";

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: React.ReactNode;
  };

/**
 * Standard internal link for this site: renders a real `next/link` (so it works
 * with prefetching, keyboard activation, middle-click/new-tab, and with
 * JavaScript disabled), but intercepts plain left-clicks to run the shared
 * X-mark route transition before navigating. External links, downloads,
 * mailto:/tel:, and in-page anchors should use a plain `<a>` instead.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(function TransitionLink(
  { href, onClick, children, ...rest },
  ref,
) {
  const navigate = useTransitionNavigate();
  const hrefString = typeof href === "string" ? href : (href.pathname ?? "");

  return (
    <Link
      ref={ref}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) navigate(event, hrefString);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
});
