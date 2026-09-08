import { cn } from "@/lib/cn";

export type ContainerWidth = "narrow" | "article" | "default" | "wide";

const WIDTH_CLASSES: Record<ContainerWidth, string> = {
  narrow: "max-w-[640px]",
  article: "max-w-[720px]",
  default: "max-w-[1000px]",
  wide: "max-w-[1180px]",
};

export function Container({
  width = "wide",
  className,
  children,
}: {
  width?: ContainerWidth;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full px-5 sm:px-10", WIDTH_CLASSES[width], className)}>{children}</div>;
}
