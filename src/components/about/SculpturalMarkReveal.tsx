"use client";

import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand/BrandMark";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** About's one-time "emboss + light sweep" reveal on the pearl/silver mark. */
export function SculpturalMarkReveal() {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto h-[150px] w-[150px]" style={{ filter: "grayscale(1) contrast(1.1)" }}>
      <BrandMark material="pearl" size={150} />
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)",
            mixBlendMode: "overlay",
          }}
          initial={{ opacity: 0, x: "-120%" }}
          animate={{ opacity: [0, 1, 0], x: ["-120%", "0%", "120%"] }}
          transition={{ duration: 1.6, delay: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        />
      )}
    </div>
  );
}
