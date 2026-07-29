/**
 * useBrandPalette.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useBrandPalette.ts
 * @module Hooks
 *
 * @description
 * Paleta de marca resolvida para um provider ou projeto.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎨 useBrandPalette — Resolve a paleta multicor de um provider.
 * Prioridade:
 *  1. Override no DB (cor explícita do admin → mantém comportamento mono-cor)
 *  2. SVG inline customizado (extrai múltiplas cores)
 *  3. URL customizada (extrai múltiplas cores via canvas)
 *  4. Paleta conhecida (KNOWN_BRAND_PALETTES) por slug
 *  5. fallback (cor padrão do catálogo)
 *
 * Reage em tempo real a alterações globais de branding (Realtime via useLogoOverrides)
 * e à conclusão da extração assíncrona de URLs.
 */
import { useEffect, useMemo, useState } from "react";
import { useLogoOverrides } from "./useLogoOverrides";
import {
  extractPaletteFromSvg,
  extractPaletteFromImage,
  getCachedPalette,
  subscribePalettes,
  KNOWN_BRAND_PALETTES,
  buildBrandTokens,
  type BrandTokens,
} from "@/core/branding/palette-engine";

export function useBrandPalette(slug?: string, fallback = "#ffffff"): BrandTokens {
  const { get } = useLogoOverrides();
  const ov = get(slug);

  // SVG inline: extração síncrona
  const svgPalette = useMemo(
    () => (ov?.customSvg ? extractPaletteFromSvg(ov.customSvg) : []),
    [ov?.customSvg],
  );

  // URL externa: extração assíncrona
  const initialUrlPalette = ov?.customUrl ? getCachedPalette(ov.customUrl) ?? [] : [];
  const [urlPalette, setUrlPalette] = useState<string[]>(initialUrlPalette);

  useEffect(() => {
    if (!ov?.customUrl) { setUrlPalette([]); return; }
    const cached = getCachedPalette(ov.customUrl);
    if (cached) { setUrlPalette(cached); return; }
    let alive = true;
    extractPaletteFromImage(ov.customUrl).then((p) => { if (alive) setUrlPalette(p); });
    const unsub = subscribePalettes(() => {
      if (!alive) return;
      const v = getCachedPalette(ov.customUrl!);
      if (v) setUrlPalette(v);
    });
    return () => { alive = false; unsub(); };
  }, [ov?.customUrl]);

  return useMemo(() => {
    // 0. Paleta customizada explícita (admin) → prioridade máxima
    if (ov?.palette && ov.palette.length) return buildBrandTokens(ov.palette, fallback);
    // 1. Override com cor explícita → mono-cor forçada
    if (ov?.color && !ov.customSvg && !ov.customUrl) {
      return buildBrandTokens([ov.color], fallback);
    }
    // 2. SVG inline
    if (svgPalette.length) return buildBrandTokens(svgPalette, fallback);
    // 3. URL externa
    if (urlPalette.length) return buildBrandTokens(urlPalette, fallback);
    // 4. Paleta conhecida
    const known = slug ? KNOWN_BRAND_PALETTES[slug] : undefined;
    if (known?.length) return buildBrandTokens(known, fallback);
    // 5. Fallback
    return buildBrandTokens([ov?.color || fallback], fallback);
  }, [ov?.color, ov?.customSvg, ov?.customUrl, ov?.palette, svgPalette, urlPalette, slug, fallback]);
}
