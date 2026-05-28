/**
 * ✨ BorderBeam — Animated brand-aware beam orbiting a card border
 * Inspired by Magic UI / Linear / Vercel. Pure CSS conic-gradient + mask.
 */
import { CSSProperties } from "react";

export interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  /** when true, only renders on hover (parent must be `group`) */
  hoverOnly?: boolean;
}

export default function BorderBeam({
  size = 200,
  duration = 8,
  delay = 0,
  colorFrom = "#ffffff",
  colorTo = "#a78bfa",
  className = "",
  hoverOnly = false,
}: BorderBeamProps) {
  const style: CSSProperties = {
    // CSS vars consumed by the keyframes defined in index.css
    ["--beam-size" as any]: `${size}px`,
    ["--beam-duration" as any]: `${duration}s`,
    ["--beam-delay" as any]: `-${delay}s`,
    ["--beam-from" as any]: colorFrom,
    ["--beam-to" as any]: colorTo,
  };

  return (
    <div
      aria-hidden
      style={style}
      className={[
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "[border:1px_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect]",
        "[mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-[var(--beam-size)]",
        "after:animate-border-beam after:[animation-delay:var(--beam-delay)]",
        "after:[background:linear-gradient(to_left,var(--beam-from),var(--beam-to),transparent)]",
        "after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_var(--beam-size))]",
        hoverOnly ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500" : "",
        className,
      ].join(" ")}
    />
  );
}
