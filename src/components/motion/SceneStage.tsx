import type { FormId } from "@/lib/motion/scene/forms";
import { cn } from "@/lib/cn";

/**
 * One directed scene in the page sequence. The stage declares which form the
 * shared environment should hold while it is on screen; it renders no canvas
 * of its own, so the background stays one continuous system.
 */
export function SceneStage({
  scene,
  children,
  className,
  height = "full",
  id,
}: {
  scene: FormId;
  children: React.ReactNode;
  className?: string;
  /** `full` pins a whole viewport to this idea; `tall` gives scroll room for a morph. */
  height?: "full" | "tall" | "auto";
  id?: string;
}) {
  return (
    <section
      id={id}
      data-scene={scene}
      className={cn(
        "relative z-10 flex w-full items-center",
        height === "full" && "min-h-screen",
        height === "tall" && "min-h-[180vh]",
        height === "auto" && "py-[clamp(80px,12vw,180px)]",
        className,
      )}
    >
      <div className="w-full">{children}</div>
    </section>
  );
}
