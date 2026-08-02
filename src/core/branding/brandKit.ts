/**
 * 🚀 brandKit.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/core/branding/brandKit.ts
 * @module Core/Branding
 * @layer Domain / Core
 * @status Active
 *
 * @description
 * Montagem do brand kit exportável (tokens, paleta e variações de
 * logo).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `buildMonogramSvg`, `BrandKitOptions`, `generateBrandKitZip`, `downloadBlob`
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
 * @see src/core/branding/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🎁 brandKit — gera um favicon kit + monograma SVG/PNG empacotado em ZIP.
 * Não depende de assets remotos: usa nome + cor para construir um monograma
 * tipográfico consistente. Útil como fallback quando o usuário não tem SVG oficial.
 */
import JSZip from "jszip";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const PNG_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 384, 512] as const;

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function contrastFg(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#0a0a0a" : "#ffffff";
}

/**
 * Gera o SVG de monograma da marca a partir das iniciais e da cor de destaque.
 *
 * @returns Markup SVG pronto para download ou inline.
 */
export function buildMonogramSvg(name: string, color: string, size = 512, rounded = true): string {
  const fg = contrastFg(color);
  const initials = getInitials(name);
  const fontSize = Math.round(size * (initials.length === 1 ? 0.6 : 0.45));
  const radius = rounded ? Math.round(size * 0.18) : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.82"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#g)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif"
        font-weight="800" font-size="${fontSize}" fill="${fg}" letter-spacing="-2">${initials}</text>
</svg>`;
}

async function svgToPng(svg: string, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((b) => {
        URL.revokeObjectURL(url);
        if (!b) return reject(new Error("png_blob_failed"));
        resolve(b);
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("svg_decode_failed")); };
    img.src = url;
  });
}

/** Encodes a single PNG into a minimal Windows ICO container. */
async function pngToIco(png16: Blob, png32: Blob, png48: Blob): Promise<Blob> {
  const entries = [
    { size: 16, blob: png16 },
    { size: 32, blob: png32 },
    { size: 48, blob: png48 },
  ];
  const buffers = await Promise.all(entries.map(e => e.blob.arrayBuffer()));
  let offset = 6 + entries.length * 16;
  const header = new ArrayBuffer(6 + entries.length * 16);
  const dv = new DataView(header);
  dv.setUint16(0, 0, true);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, entries.length, true);
  entries.forEach((e, i) => {
    const start = 6 + i * 16;
    dv.setUint8(start, e.size === 256 ? 0 : e.size);
    dv.setUint8(start + 1, e.size === 256 ? 0 : e.size);
    dv.setUint8(start + 2, 0); dv.setUint8(start + 3, 0);
    dv.setUint16(start + 4, 1, true);
    dv.setUint16(start + 6, 32, true);
    dv.setUint32(start + 8, buffers[i].byteLength, true);
    dv.setUint32(start + 12, offset, true);
    offset += buffers[i].byteLength;
  });
  return new Blob([header, ...buffers], { type: "image/x-icon" });
}

export interface BrandKitOptions {
  name: string;
  color: string;
  slug: string;
  customSvg?: string; // override the monogram with a real SVG (e.g. official logo)
}

/**
 * Empacota o brand kit (logos, paleta, tokens e guia) em um arquivo ZIP.
 *
 * @returns Blob do ZIP gerado no browser.
 */
export async function generateBrandKitZip(opts: BrandKitOptions): Promise<{ blob: Blob; filename: string }> {
  const { name, color, slug } = opts;
  const baseSvg = opts.customSvg && opts.customSvg.trim().startsWith("<svg")
    ? opts.customSvg
    : buildMonogramSvg(name, color, 512, true);

  const zip = new JSZip();
  const root = zip.folder(`${slug}-brand-kit`)!;

  // Source SVGs (rounded + square)
  root.file("logo.svg", baseSvg);
  root.file("logo-square.svg", buildMonogramSvg(name, color, 512, false));

  // PNGs
  const pngFolder = root.folder("png")!;
  const pngBlobs: Record<number, Blob> = {};
  await Promise.all(
    PNG_SIZES.map(async (s) => {
      const renderSvg = buildMonogramSvg(name, color, s, true);
      const b = await svgToPng(renderSvg, s);
      pngBlobs[s] = b;
      pngFolder.file(`logo-${s}.png`, b);
    }),
  );

  // Favicon kit
  const favicon = root.folder("favicon")!;
  favicon.file("favicon-16x16.png", pngBlobs[16]);
  favicon.file("favicon-32x32.png", pngBlobs[32]);
  favicon.file("favicon-48x48.png", pngBlobs[48]);
  favicon.file("apple-touch-icon.png", pngBlobs[180]);
  favicon.file("android-chrome-192x192.png", pngBlobs[192]);
  favicon.file("android-chrome-512x512.png", pngBlobs[512]);

  // ICO
  try {
    const ico = await pngToIco(pngBlobs[16], pngBlobs[32], pngBlobs[48]);
    favicon.file("favicon.ico", ico);
  } catch { /* ignore */ }

  // Web manifest
  favicon.file("site.webmanifest", JSON.stringify({
    name, short_name: name, theme_color: color, background_color: "#000000", display: "standalone",
    icons: [
      { src: "android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  }, null, 2));

  // README + tokens
  root.file("README.md",
`# ${name} — Brand Kit

Cor primária: \`${color}\`

## Estrutura
- \`logo.svg\` — vetor com cantos arredondados (recomendado)
- \`logo-square.svg\` — vetor square (para favicon e ícones de app)
- \`png/\` — PNGs em todos os tamanhos (${PNG_SIZES.join(", ")})
- \`favicon/\` — kit completo (favicon.ico, apple-touch, android-chrome, site.webmanifest)

## HTML quickstart
\`\`\`html
<link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
<link rel="manifest" href="/favicon/site.webmanifest" />
<meta name="theme-color" content="${color}" />
\`\`\`

Gerado pelo SevenOS Brand Studio.
`);

  root.file("tokens.json", JSON.stringify({
    name, slug, primary: color, sizes: PNG_SIZES, generated_at: new Date().toISOString(),
  }, null, 2));

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { blob, filename: `${slug}-brand-kit.zip` };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}
