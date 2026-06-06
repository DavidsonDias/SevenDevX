/**
 * 🎨 Brand tokens derived from a palette.
 * Generates ready-to-consume CSS for glow / beam / halo / gradient / border.
 */
export interface BrandTokens {
  palette: string[];
  primary: string;
  secondary?: string;
  tertiary?: string;
  isMulticolor: boolean;
  /** conic-gradient string for animated multi-color glow */
  conicGradient: string;
  /** linear-gradient for top border */
  topBorderGradient: string;
  /** radial halo background */
  haloRadial: string;
  /** rotating gradient overlay (for hover) */
  hoverOverlay: string;
}

export function buildBrandTokens(palette: string[], fallback = "#ffffff"): BrandTokens {
  const clean = (palette || []).filter(Boolean);
  const pal = clean.length ? clean : [fallback];
  const primary = pal[0];
  const secondary = pal[1];
  const tertiary = pal[2];
  const isMulticolor = pal.length >= 2;

  const stops = isMulticolor
    ? pal.concat(pal[0]).map((c, i, a) => `${c} ${(i * 100) / (a.length - 1)}%`).join(", ")
    : `${primary} 0%, ${primary} 100%`;

  return {
    palette: pal,
    primary,
    secondary,
    tertiary,
    isMulticolor,
    conicGradient: isMulticolor
      ? `conic-gradient(from 0deg, ${pal.join(", ")}, ${pal[0]})`
      : `radial-gradient(circle, ${primary}66, transparent 70%)`,
    topBorderGradient: isMulticolor
      ? `linear-gradient(90deg, transparent, ${stops}, transparent)`
      : `linear-gradient(90deg, transparent, ${primary}, transparent)`,
    haloRadial: isMulticolor
      ? `radial-gradient(circle at 30% 20%, ${primary}55, transparent 55%), radial-gradient(circle at 70% 80%, ${secondary || primary}55, transparent 55%)${tertiary ? `, radial-gradient(circle at 50% 50%, ${tertiary}33, transparent 60%)` : ""}`
      : `radial-gradient(circle at top left, ${primary}55, transparent 70%)`,
    hoverOverlay: isMulticolor
      ? `conic-gradient(from var(--bp-angle,0deg), ${pal.join(", ")}, ${pal[0]})`
      : `radial-gradient(circle at top right, ${primary}33, transparent 60%)`,
  };
}
