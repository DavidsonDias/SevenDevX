/**
 * 🌈 BrandHalo — Halo + ring multicolor reativo à paleta da marca.
 * Para logos monocromáticas: glow simples.
 * Para logos multicoloridas: conic-gradient animado (halo + anel).
 *
 * Deve ser usado dentro de um container `position: relative` com classe `group`
 * para herdar os estados de hover.
 */
import type { BrandTokens } from "@/core/branding/palette-engine";

export default function BrandHalo({
  tokens,
  intensity = 1,
  alwaysOn = false,
  className = "",
}: {
  tokens: BrandTokens;
  intensity?: number;
  alwaysOn?: boolean;
  className?: string;
}) {
  if (tokens.isMulticolor) {
    return (
      <>
        <div
          aria-hidden
          className={`bp-halo-multicolor ${alwaysOn ? "!opacity-60" : ""} ${className}`}
          style={{
            ["--bp-conic" as any]: tokens.conicGradient,
            filter: `blur(${18 * intensity}px)`,
          }}
        />
        <div
          aria-hidden
          className="bp-ring-multicolor"
          style={{ ["--bp-conic" as any]: tokens.conicGradient }}
        />
      </>
    );
  }
  // Mono — glow simples
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${alwaysOn ? "!opacity-100" : ""} ${className}`}
      style={{ background: `radial-gradient(circle at top left, ${tokens.primary}55, transparent 70%)` }}
    />
  );
}
