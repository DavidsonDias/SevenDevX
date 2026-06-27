/**
 * 🎨 Brand Studio — extrai paleta + favicon kit de qualquer URL.
 * Input: URL pública → backend faz scan (favicons, og:image, theme-color, meta) →
 * cliente extrai paleta multicor e gera favicon kit (16/32/180/512) via canvas.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Download, Globe, Copy, Check, Palette as PaletteIcon, Image as ImageIcon } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { extractPaletteFromImage } from "@/core/branding/palette-engine/extractPalette";

type ScanResult = {
  url: string;
  name?: string;
  title?: string;
  description?: string;
  themeColor?: string;
  ogImage?: string;
  twitterImage?: string;
  icons: { href: string; sizes?: string; rel: string }[];
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function rasterize(srcUrl: string, size: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((b) => resolve(b), "image/png");
    };
    img.onerror = () => resolve(null);
    img.src = srcUrl;
  });
}

function Swatch({ color, onCopy }: { color: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
    onCopy();
  };
  return (
    <button onClick={handleCopy}
      className="group relative flex flex-col items-stretch rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all w-full">
      <div className="h-20 sm:h-24" style={{ background: color }} />
      <div className="px-3 py-2 bg-black/60 backdrop-blur flex items-center justify-between gap-2">
        <code className="text-[11px] font-mono text-white/80">{color}</code>
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white/40 group-hover:text-white/80" />}
      </div>
    </button>
  );
}

export default function BrandStudioAdmin() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [paletteSource, setPaletteSource] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [rasterBusy, setRasterBusy] = useState<number | null>(null);

  const runScan = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(null); setScan(null); setPalette([]); setPaletteSource(null);
    const { data, error } = await supabase.functions.invoke("brand-scan", { body: { url: url.trim() } });
    setLoading(false);
    if (error || (data as any)?.error) {
      setError((data as any)?.error || error?.message || "Falha no scan"); return;
    }
    const result = data as ScanResult;
    setScan(result);
    // Auto-extract paleta do melhor source
    const bestSource = result.ogImage || result.twitterImage || result.icons.find(i => /512|256|180|192/.test(i.sizes || ""))?.href || result.icons[0]?.href;
    if (bestSource) {
      setExtracting(true);
      const pal = await extractPaletteFromImage(bestSource, 6);
      setPalette(result.themeColor ? [result.themeColor, ...pal.filter(c => c.toLowerCase() !== result.themeColor!.toLowerCase())].slice(0, 6) : pal);
      setPaletteSource(bestSource);
      setExtracting(false);
    } else if (result.themeColor) {
      setPalette([result.themeColor]);
    }
  };

  const reExtractFrom = async (src: string) => {
    setExtracting(true); setPaletteSource(src);
    const pal = await extractPaletteFromImage(src, 6);
    setPalette(scan?.themeColor ? [scan.themeColor, ...pal.filter(c => c.toLowerCase() !== scan.themeColor!.toLowerCase())].slice(0, 6) : pal);
    setExtracting(false);
  };

  const exportTokens = () => {
    if (!scan || !palette.length) return;
    const slug = (scan.name || new URL(scan.url).hostname).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const css = `:root {\n${palette.map((c, i) => `  --brand-${i === 0 ? "primary" : `accent-${i}`}: ${c};`).join("\n")}\n}\n`;
    const json = { slug, name: scan.name, url: scan.url, themeColor: scan.themeColor, palette, ogImage: scan.ogImage, icons: scan.icons };
    const tailwind = `// tailwind.config.ts excerpt\nextend: { colors: { brand: {\n${palette.map((c, i) => `  ${i === 0 ? "DEFAULT" : (i * 100)}: "${c}",`).join("\n")}\n} } }\n`;
    const bundle = [
      "/* brand-tokens.css */", css, "",
      "/* tailwind snippet */", tailwind, "",
      "/* brand.json */", JSON.stringify(json, null, 2),
    ].join("\n");
    downloadBlob(new Blob([bundle], { type: "text/plain" }), `${slug}-brand-tokens.txt`);
  };

  const exportFaviconAt = async (size: number) => {
    if (!scan) return;
    const src = scan.ogImage || scan.icons.find(i => /512|256/.test(i.sizes || ""))?.href || scan.icons[0]?.href;
    if (!src) return;
    setRasterBusy(size);
    const blob = await rasterize(src, size);
    setRasterBusy(null);
    if (!blob) { setError("Falha ao rasterizar — imagem CORS bloqueada"); return; }
    const slug = (scan.name || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadBlob(blob, `${slug}-${size}x${size}.png`);
  };

  return (
    <AdminPageShell
      title="Brand Studio"
      subtitle="Extração automática de identidade visual · paleta multicor + favicon kit"
      actions={<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] uppercase tracking-[0.2em]"><Sparkles className="w-3 h-3" /> AI Powered</span>}
    >
      <div className="space-y-6">
        {/* Input */}
        <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3 block">URL alvo</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runScan()}
                placeholder="ex: stripe.com, https://vercel.com, lovable.dev"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            <button onClick={runScan} disabled={loading || !url.trim()}
              className="px-6 py-3.5 rounded-xl bg-white text-black text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Extrair identidade
            </button>
          </div>
          {error && <p className="text-xs text-red-300 mt-3">{error}</p>}
        </div>

        <AnimatePresence>
          {scan && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Identity card */}
              <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                <div className="p-6 rounded-2xl border border-white/10 bg-black/40 relative overflow-hidden">
                  {palette[0] && (
                    <div className="absolute -inset-px opacity-30 pointer-events-none" style={{
                      background: `radial-gradient(circle at 30% 0%, ${palette[0]}, transparent 60%)`
                    }} />
                  )}
                  <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Identidade detectada</p>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: palette[0] || "#fff" }}>{scan.name || scan.title || "Sem nome"}</h2>
                    <a href={scan.url} target="_blank" rel="noreferrer" className="text-xs text-white/50 hover:text-white inline-block mb-3 break-all">{scan.url}</a>
                    {scan.description && <p className="text-sm text-white/70 max-w-2xl line-clamp-2">{scan.description}</p>}
                    {scan.themeColor && (
                      <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs">
                        <span className="w-3 h-3 rounded-full" style={{ background: scan.themeColor }} />
                        theme-color: <code className="font-mono">{scan.themeColor}</code>
                      </div>
                    )}
                  </div>
                </div>
                {scan.ogImage && (
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                    <img src={scan.ogImage} alt="og" className="w-full aspect-video object-cover" />
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/40 border-t border-white/10">OG Image</div>
                  </div>
                )}
              </div>

              {/* Palette */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                    <PaletteIcon className="w-4 h-4" /> Paleta multicor {extracting && <Loader2 className="w-3 h-3 animate-spin" />}
                  </h3>
                  <button onClick={exportTokens} disabled={!palette.length}
                    className="px-3 py-1.5 rounded-lg border border-white/15 text-xs inline-flex items-center gap-2 hover:bg-white/5 disabled:opacity-30">
                    <Download className="w-3 h-3" /> Export tokens (CSS + Tailwind + JSON)
                  </button>
                </div>
                {palette.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {palette.map((c) => <Swatch key={c} color={c} onCopy={() => {}} />)}
                  </div>
                ) : (
                  <p className="text-xs text-white/40">Nenhuma cor extraída ainda.</p>
                )}
                {paletteSource && (
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mt-2">Fonte: {new URL(paletteSource).pathname.split("/").pop()}</p>
                )}
              </div>

              {/* Icons grid + favicon kit */}
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-white/60 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Ícones detectados · clique para reextrair paleta
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {scan.icons.map((ic) => (
                    <button key={ic.href} onClick={() => reExtractFrom(ic.href)}
                      className={`group p-3 rounded-xl border bg-black/40 flex flex-col items-center gap-2 transition-all ${
                        paletteSource === ic.href ? "border-white/40 ring-2 ring-white/20" : "border-white/10 hover:border-white/30"
                      }`}>
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                        <img src={ic.href} alt="" className="max-w-full max-h-full" onError={(e) => (e.currentTarget.style.opacity = "0.2")} />
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-white/40 truncate w-full text-center">{ic.sizes || ic.rel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Favicon kit export */}
              <div className="p-5 rounded-2xl border border-white/10 bg-black/40">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Favicon kit — gerar a partir da melhor imagem</p>
                <div className="flex flex-wrap gap-2">
                  {[16, 32, 48, 64, 128, 180, 192, 256, 512].map((s) => (
                    <button key={s} onClick={() => exportFaviconAt(s)} disabled={rasterBusy !== null}
                      className="px-3 py-2 rounded-lg border border-white/15 hover:bg-white/5 text-xs font-mono inline-flex items-center gap-1.5 disabled:opacity-30">
                      {rasterBusy === s ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      {s}×{s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-white/30 mt-3">Imagens com CORS aberto podem ser rasterizadas — caso contrário, baixe manualmente.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!scan && !loading && (
          <div className="text-center py-16 text-white/30 border border-dashed border-white/10 rounded-2xl">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Cole uma URL acima para extrair a identidade visual completa.</p>
            <p className="text-xs mt-1">Paleta multicor · ícones · OG image · theme-color · favicon kit</p>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
