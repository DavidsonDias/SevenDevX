/**
 * 🌈 BrandHalo — Halo circular orbital + ring multicolor reativo à paleta.
 * Mono: glow radial sutil.
 * Multi: disco circular conic-gradient com máscara radial (sem cantos quadrados)
 *        + anel de borda seguindo o formato do card.
 *
 * Use dentro de container `position: relative` + `group`.
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
          className={`bp-halo-multicolor ${alwaysOn ? "bp-always-on" : ""} ${className}`}
          style={{
            ["--bp-conic" as any]: tokens.conicGradient,
            filter: `blur(${38 * intensity}px) saturate(1.3)`,
          }}
        />
        <div
          aria-hidden
          className={`bp-ring-multicolor ${alwaysOn ? "bp-always-on" : ""}`}
          style={{ ["--bp-conic" as any]: tokens.conicGradient }}
        />
      </>
    );
  }
  // Mono — glow radial simples
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${alwaysOn ? "!opacity-100" : ""} ${className}`}
      style={{ background: `radial-gradient(circle at top left, ${tokens.primary}55, transparent 70%)` }}
    />
  );
}
