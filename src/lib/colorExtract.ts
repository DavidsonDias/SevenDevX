/**
 * colorExtract.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/lib/colorExtract.ts
 * @module Lib
 *
 * @description
 * Utilitários de extração e manipulação de cor.
 *
 * @see src/lib/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎨 Color Extraction Engine
 *
 * Deriva a cor primária de um logo customizado para alimentar glow/beam/border.
 *  - SVG inline: parser síncrono via regex (fills, stops, stroke).
 *  - URL/imagem: amostragem via canvas (assíncrono, com cache).
 *
 * Heurística:
 *  - Ignora preto/branco/transparente quando há alternativa colorida.
 *  - Prioriza cores saturadas. Cai para o tom mais frequente caso contrário.
 */

const NEUTRAL = (h: number, s: number, l: number) =>
  s < 0.12 || l < 0.06 || l > 0.94;

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

function parseColorToken(tok: string): [number, number, number] | null {
  const t = tok.trim().toLowerCase();
  if (!t || t === "none" || t === "transparent" || t === "currentcolor") return null;
  if (t.startsWith("#")) return hexToRgb(t);
  const rgb = t.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
  const hsl = t.match(/hsla?\s*\(\s*(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
  if (hsl) {
    // simple hsl->rgb
    const h = +hsl[1] / 360, s = +hsl[2] / 100, l = +hsl[3] / 100;
    const k = (n: number) => (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }
  // named colors are rare in raw SVG export; skip.
  return null;
}

/** Extrai a melhor cor de uma string SVG (síncrono). */
export function extractColorFromSvg(svg: string): string | null {
  if (!svg) return null;
  const candidates: [number, number, number][] = [];
  const regex = /(?:fill|stop-color|stroke)\s*[:=]\s*["']?([^"'\s;>)]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(svg)) !== null) {
    const rgb = parseColorToken(m[1]);
    if (rgb) candidates.push(rgb);
  }
  // attributes without quotes: fill=#abc
  return pickBest(candidates);
}

function pickBest(candidates: [number, number, number][]): string | null {
  if (!candidates.length) return null;
  // bucket por hue arredondado para detectar dominante saturada
  const buckets = new Map<string, { count: number; r: number; g: number; b: number; sat: number }>();
  for (const [r, g, b] of candidates) {
    const { h, s, l } = rgbToHsl(r, g, b);
    if (NEUTRAL(h, s, l)) continue;
    const key = Math.round(h * 24).toString();
    const cur = buckets.get(key);
    if (cur) { cur.count++; cur.r += r; cur.g += g; cur.b += b; cur.sat = Math.max(cur.sat, s); }
    else buckets.set(key, { count: 1, r, g, b, sat: s });
  }
  if (!buckets.size) {
    // fallback: pega a primeira não-neutra mesmo com sat baixa
    for (const [r, g, b] of candidates) {
      const { h, s, l } = rgbToHsl(r, g, b);
      if (l > 0.06 && l < 0.94) return rgbToHex(r, g, b);
    }
    return null;
  }
  let best = Array.from(buckets.values()).sort(
    (a, b) => b.count * (0.5 + b.sat) - a.count * (0.5 + a.sat),
  )[0];
  return rgbToHex(
    Math.round(best.r / best.count),
    Math.round(best.g / best.count),
    Math.round(best.b / best.count),
  );
}

// ---------- async image sampling ----------
const imgCache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();
const SUB = new Set<() => void>();

export function subscribeImgColors(cb: () => void) {
  SUB.add(cb);
  return () => SUB.delete(cb);
}
function notify() { SUB.forEach((cb) => cb()); }

export function getCachedImageColor(url?: string | null): string | null | undefined {
  if (!url) return undefined;
  return imgCache.has(url) ? imgCache.get(url) : undefined;
}

export function extractColorFromImage(url: string): Promise<string | null> {
  if (imgCache.has(url)) return Promise.resolve(imgCache.get(url) ?? null);
  if (inflight.has(url)) return inflight.get(url)!;
  const p = new Promise<string | null>((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const w = 32, h = 32;
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          const cands: [number, number, number][] = [];
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 80) continue;
            cands.push([data[i], data[i + 1], data[i + 2]]);
          }
          resolve(pickBest(cands));
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch { resolve(null); }
  }).then((c) => {
    imgCache.set(url, c);
    inflight.delete(url);
    notify();
    return c;
  });
  inflight.set(url, p);
  return p;
}
