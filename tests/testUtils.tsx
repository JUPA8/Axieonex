import type { ReactNode } from "react";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";

export function withTransitionProvider(children: ReactNode) {
  return <PageTransitionProvider>{children}</PageTransitionProvider>;
}
