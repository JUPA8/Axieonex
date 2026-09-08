"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

function getSnapshot() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const max = scrollHeight - clientHeight;
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (scrollTop / max) * 100));
}

function getServerSnapshot() {
  return 0;
}

export function ReadingProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div
      aria-hidden="true"
      className="fixed left-0 top-0 z-(--ax-z-nav) h-0.5 bg-[image:linear-gradient(90deg,#3E7BFA,#B79CEF)] transition-[width] duration-150"
      style={{ width: `${progress}%`, zIndex: "var(--ax-z-nav)" }}
    />
  );
}
