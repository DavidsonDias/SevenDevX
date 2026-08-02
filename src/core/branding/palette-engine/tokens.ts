/**
 * 🚀 tokens.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/core/branding/palette-engine/tokens.ts
 * @module Core/Branding
 * @layer Domain / Core
 * @status Active
 *
 * @description
 * Conversão da paleta extraída em design tokens (CSS custom
 * properties).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `BrandTokens`, `buildBrandTokens`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

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

/**
 * Deriva os design tokens da marca (base, contraste, glow e beam) a partir da paleta.
 *
 * @param palette - Cores dominantes já extraídas.
 * @param fallback - Cor usada quando a paleta está vazia.
 */
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

  // Suavização: duplica primeira cor no fim p/ loop contínuo e usa o @property --bp-angle
  // (assim o GRADIENTE rotaciona, e não o box — evitando seams diagonais no card).
  const conicSmooth = isMulticolor
    ? `conic-gradient(from var(--bp-angle, 0deg), ${pal.join(", ")}, ${pal[0]})`
    : `conic-gradient(from var(--bp-angle, 0deg), ${primary}, ${primary})`;

  return {
    palette: pal,
    primary,
    secondary,
    tertiary,
    isMulticolor,
    conicGradient: conicSmooth,
    topBorderGradient: isMulticolor
      ? `linear-gradient(90deg, transparent, ${stops}, transparent)`
      : `linear-gradient(90deg, transparent, ${primary}, transparent)`,
    haloRadial: isMulticolor
      ? `radial-gradient(circle at 30% 20%, ${primary}55, transparent 55%), radial-gradient(circle at 70% 80%, ${secondary || primary}55, transparent 55%)${tertiary ? `, radial-gradient(circle at 50% 50%, ${tertiary}33, transparent 60%)` : ""}`
      : `radial-gradient(circle at top left, ${primary}55, transparent 70%)`,
    hoverOverlay: conicSmooth,
  };
}
