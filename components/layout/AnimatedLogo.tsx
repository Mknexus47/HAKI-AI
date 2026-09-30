"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AnimatedLogoProps = {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: number;
};

/**
 * Animated brand logo.
 *
 * Behaviour:
 * - On platform open (mount): pops in with scale + fade + slight rotate.
 * - Idle: gentle float + soft gold glow pulse + periodic shine sweep.
 * - Hover / focus: lifts, straightens and boosts the glow.
 * - Respects prefers-reduced-motion (renders static).
 */
export default function AnimatedLogo({
  className,
  imageClassName,
  textClassName,
  showText = true,
  size = 44,
}: AnimatedLogoProps) {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", onChange);

    // Trigger entrance on next frame so the CSS transition runs on open
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true)),
    );

    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener?.("change", onChange);
    };
  }, []);

  const animate = !reduceMotion;

  return (
    <Link
      href="/"
      aria-label="HAKI AI home"
      className={cn(
        "logo-animated group flex items-center gap-2 outline-none",
        animate && !mounted && "logo-pre-enter",
        animate && mounted && "logo-entered",
        className,
      )}
    >
      <span
        className={cn(
          "logo-mark relative inline-grid shrink-0 place-items-center",
          animate && "logo-float",
        )}
      >
        {/* soft pulsing glow behind the mark */}
        {animate && <span aria-hidden="true" className="logo-glow" />}
        <Image
          src="/logo-icon.jpg"
          alt="HAKI AI logo"
          width={size}
          height={size}
          priority
          className={cn(
            "relative h-11 w-11 rounded-xl object-cover shadow-sm ring-1 ring-black/5 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3 group-focus-visible:scale-105",
            imageClassName,
          )}
        />
        {/* shine sweep across the mark */}
        {animate && <span aria-hidden="true" className="logo-shine" />}
      </span>

      {showText && (
        <span
          className={cn(
            "text-gradient-brand text-2xl font-bold tracking-tight",
            animate && "logo-text-shimmer",
            textClassName,
          )}
        >
          HAKI AI
        </span>
      )}
    </Link>
  );
}
