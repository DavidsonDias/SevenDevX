/**
 * 🌈 BrandHalo — Aura orbital enterprise.
 * Mono: glow radial sutil.
 * Multi: halo difuso (segue o formato do card) + ring de borda multicolor.
 *        O GRADIENTE rotaciona via @property --bp-angle — o box fica parado,
 *        evitando seams/diagonais em cantos.
 *
 * Use dentro de container com `position: relative` + classe `group`.
 */
import type { CSSProperties } from "react";
import type { BrandTokens } from "@/core/branding/palette-engine";

export default function BrandHalo({
  tokens,
  alwaysOn = false,
  readable = false,
  className = "",
}: {
  tokens: BrandTokens;
  /** Compat — não usado (intensidade controlada via CSS). */
  intensity?: number;
  alwaysOn?: boolean;
  /** Reduce decoration behind operational text without changing brand colors. */
  readable?: boolean;
  className?: string;
}) {
  if (tokens.isMulticolor) {
    const style: CSSProperties & { "--bp-conic": string } = { "--bp-conic": tokens.conicGradient };
    return (
      <>
        <div aria-hidden className={`bp-halo-multicolor ${alwaysOn ? "bp-always-on" : ""} ${readable ? "bp-readable" : ""} ${className}`} style={style} />
        <div aria-hidden className={`bp-ring-multicolor ${alwaysOn ? "bp-always-on" : ""} ${readable ? "bp-readable" : ""}`} style={style} />
      </>
    );
  }
  // Mono — glow radial simples
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${alwaysOn ? "!opacity-100" : ""} ${className}`}
      style={{ background: `radial-gradient(circle at top left, ${tokens.primary}${readable ? "30" : "55"}, transparent 70%)` }}
    />
  );
}
