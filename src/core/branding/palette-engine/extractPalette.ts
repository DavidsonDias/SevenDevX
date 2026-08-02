/**
 * 🚀 extractPalette.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/core/branding/palette-engine/extractPalette.ts
 * @module Core/Branding
 * @layer Domain / Core
 * @status Active
 *
 * @description
 * Extração de paleta dominante a partir de uma imagem de marca.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `subscribePalettes`, `getCachedPalette`, `extractPaletteFromSvg`, `extractPaletteFromImage`
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
 * 🎨 Multi-color palette extraction (SVG inline + raster image).
 * Returns up to N saturated, distinct colors ranked by frequency.
 */

const imgCache = new Map<string, string[]>();
const inflight = new Map<string, Promise<string[]>>();

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUB = new Set<() => void>();

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

/**
 * Assina notificações de atualização do cache de paletas.
 *
 * @returns Função de cancelamento da assinatura.
 */
export function subscribePalettes(cb: () => void) { SUB.add(cb); return () => SUB.delete(cb); }
function notify() { SUB.forEach((cb) => cb()); }

/**
 * Lê a paleta já extraída para a URL informada, sem disparar novo processamento.
 */
export function getCachedPalette(url?: string | null): string[] | undefined {
  if (!url) return undefined;
  return imgCache.get(url);
}

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  const t = (v: number) => v.toString(16).padStart(2, "0");
  return `#${t(r)}${t(g)}${t(b)}`;
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}
function parseToken(tok: string): [number, number, number] | null {
  const t = tok.trim().toLowerCase();
  if (!t || t === "none" || t === "transparent" || t === "currentcolor") return null;
  if (t.startsWith("#")) return hexToRgb(t);
  const rgb = t.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
  const hsl = t.match(/hsla?\s*\(\s*(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
  if (hsl) {
    const h = +hsl[1] / 360, s = +hsl[2] / 100, l = +hsl[3] / 100;
    const k = (n: number) => (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }
  return null;
}

function rankPalette(cands: [number, number, number][], max = 5): string[] {
  if (!cands.length) return [];
  // bucket por hue (24 slots) ignorando neutros
  const buckets = new Map<number, { count: number; r: number; g: number; b: number; sat: number; l: number }>();
  for (const [r, g, b] of cands) {
    const { h, s, l } = rgbToHsl(r, g, b);
    if (s < 0.18 || l < 0.08 || l > 0.95) continue;
    const key = Math.round(h * 16);
    const cur = buckets.get(key);
    if (cur) { cur.count++; cur.r += r; cur.g += g; cur.b += b; cur.sat = Math.max(cur.sat, s); cur.l = (cur.l + l) / 2; }
    else buckets.set(key, { count: 1, r, g, b, sat: s, l });
  }
  const ranked = Array.from(buckets.values())
    .sort((a, b) => b.count * (0.5 + b.sat) - a.count * (0.5 + a.sat))
    .slice(0, max)
    .map((c) => rgbToHex(Math.round(c.r / c.count), Math.round(c.g / c.count), Math.round(c.b / c.count)));
  return ranked;
}

/**
 * Extrai as cores dominantes declaradas no markup SVG.
 */
export function extractPaletteFromSvg(svg: string, max = 5): string[] {
  if (!svg) return [];
  const cands: [number, number, number][] = [];
  const regex = /(?:fill|stop-color|stroke|flood-color|lighting-color)\s*[:=]\s*["']?([^"'\s;>)]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(svg)) !== null) {
    const rgb = parseToken(m[1]);
    if (rgb) cands.push(rgb);
  }
  return rankPalette(cands, max);
}

/**
 * Extrai a paleta dominante de uma imagem raster via canvas.
 *
 * @remarks Requer CORS anônimo; requisições concorrentes para a mesma URL são deduplicadas.
 */
export function extractPaletteFromImage(url: string, max = 5): Promise<string[]> {
  if (imgCache.has(url)) return Promise.resolve(imgCache.get(url)!);
  if (inflight.has(url)) return inflight.get(url)!;
  const p = new Promise<string[]>((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const w = 40, h = 40;
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return resolve([]);
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          const cands: [number, number, number][] = [];
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 80) continue;
            cands.push([data[i], data[i + 1], data[i + 2]]);
          }
          resolve(rankPalette(cands, max));
        } catch { resolve([]); }
      };
      img.onerror = () => resolve([]);
      img.src = url;
    } catch { resolve([]); }
  }).then((arr) => {
    imgCache.set(url, arr);
    inflight.delete(url);
    notify();
    return arr;
  });
  inflight.set(url, p);
  return p;
}
