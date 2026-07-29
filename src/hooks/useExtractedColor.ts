/**
 * useExtractedColor.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useExtractedColor.ts
 * @module Hooks
 *
 * @description
 * Cor dominante de uma imagem, usada em glow e realces.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎨 useExtractedColor — Resolve cor efetiva (override > extraída de SVG/URL > undefined)
 */
import { useEffect, useState } from "react";
import {
  extractColorFromImage,
  extractColorFromSvg,
  getCachedImageColor,
  subscribeImgColors,
} from "@/lib/colorExtract";

export function useExtractedColor(opts: {
  explicitColor?: string;
  customSvg?: string;
  customUrl?: string;
}): string | undefined {
  const { explicitColor, customSvg, customUrl } = opts;

  // SVG: síncrono
  const svgColor = !explicitColor && customSvg ? extractColorFromSvg(customSvg) : null;

  const [imgColor, setImgColor] = useState<string | null | undefined>(
    !explicitColor && !svgColor && customUrl ? getCachedImageColor(customUrl) : undefined,
  );

  useEffect(() => {
    if (explicitColor || svgColor || !customUrl) return;
    const cached = getCachedImageColor(customUrl);
    if (cached !== undefined) { setImgColor(cached); return; }
    let alive = true;
    extractColorFromImage(customUrl).then((c) => { if (alive) setImgColor(c); });
    const unsub = subscribeImgColors(() => {
      if (!alive) return;
      const v = getCachedImageColor(customUrl);
      if (v !== undefined) setImgColor(v);
    });
    return () => { alive = false; unsub(); };
  }, [explicitColor, svgColor, customUrl]);

  return explicitColor || svgColor || imgColor || undefined;
}
