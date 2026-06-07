/**
 * 🌈 BrandHalo — Aura orbital enterprise.
 * Mono: glow radial sutil.
 * Multi: halo difuso (segue o formato do card) + ring de borda multicolor.
 *        O GRADIENTE rotaciona via @property --bp-angle — o box fica parado,
 *        evitando seams/diagonais em cantos.
 *
 * Use dentro de container com `position: relative` + classe `group`.
 */
import type { BrandTokens } from "@/core/branding/palette-engine";

export default function BrandHalo({
  tokens,
  alwaysOn = false,
  className = "",
}: {
  tokens: BrandTokens;
  /** Compat — não usado (intensidade controlada via CSS). */
  intensity?: number;
  alwaysOn?: boolean;
  className?: string;
}) {
  if (tokens.isMulticolor) {
    const style = { ["--bp-conic" as any]: tokens.conicGradient };
    return (
      <>
        <div aria-hidden className={`bp-halo-multicolor ${alwaysOn ? "bp-always-on" : ""} ${className}`} style={style} />
        <div aria-hidden className={`bp-ring-multicolor ${alwaysOn ? "bp-always-on" : ""}`} style={style} />
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
