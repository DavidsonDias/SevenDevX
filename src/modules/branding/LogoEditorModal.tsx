/**
 * 🎨 LogoEditorModal — Editor visual de logos enterprise
 * Permite sobrescrever cor / SVG inline / URL para qualquer provider do catálogo,
 * com preview live em múltiplas variantes. Persistência via useLogoOverrides.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X, RotateCcw, Save, Paintbrush, Code2, Link2, Sparkles, Palette, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useLogoOverrides, type LogoOverride } from "@/hooks/useLogoOverrides";
import LogoRenderer, { type LogoVariant } from "@/components/ui/logo/LogoRenderer";
import BrandHalo from "@/components/ui/BrandHalo";
import { buildBrandTokens, KNOWN_BRAND_PALETTES } from "@/core/branding/palette-engine";
import type { CatalogProvider } from "@/modules/integrations/providerCatalog";

interface Props {
  open: boolean;
  provider: CatalogProvider | null;
  onClose: () => void;
}

const PREVIEW_VARIANTS: LogoVariant[] = ["sm", "md", "card", "marketplace", "hero"];

export default function LogoEditorModal({ open, provider, onClose }: Props) {
  useScrollLock(open);
  const { overrides, setOverride, resetOverride } = useLogoOverrides();
  const current: LogoOverride | undefined = provider ? overrides[provider.slug] : undefined;

  const [color, setColor] = useState<string>("");
  const [customSvg, setCustomSvg] = useState<string>("");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [palette, setPalette] = useState<string[]>([]);
  const [tab, setTab] = useState<"color" | "palette" | "svg" | "url">("color");

  useEffect(() => {
    if (!provider) return;
    setColor(current?.color || provider.color || "#ffffff");
    setCustomSvg(current?.customSvg || "");
    setCustomUrl(current?.customUrl || "");
    const initialPalette =
      current?.palette && current.palette.length
        ? current.palette
        : KNOWN_BRAND_PALETTES[provider.slug] || [provider.color || "#ffffff"];
    setPalette(initialPalette.slice(0, 5));
    setTab(
      current?.palette?.length ? "palette" :
      current?.customSvg ? "svg" :
      current?.customUrl ? "url" : "color",
    );
  }, [provider?.slug, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => {
    if (!provider) return false;
    const currentPaletteStr = JSON.stringify(current?.palette || []);
    const newPaletteStr = JSON.stringify(tab === "palette" ? palette : (current?.palette || []));
    return (
      (color || "") !== (current?.color || provider.color || "") ||
      (customSvg || "") !== (current?.customSvg || "") ||
      (customUrl || "") !== (current?.customUrl || "") ||
      currentPaletteStr !== newPaletteStr
    );
  }, [color, customSvg, customUrl, palette, tab, current, provider]);

  if (!provider) return null;

  const save = () => {
    const patch: Partial<LogoOverride> = {};
    if (color && color !== provider.color) patch.color = color;
    if (customSvg.trim()) patch.customSvg = customSvg.trim();
    if (customUrl.trim()) patch.customUrl = customUrl.trim();
    if (tab === "palette" && palette.length >= 1) patch.palette = palette;
    if (Object.keys(patch).length === 0) {
      resetOverride(provider.slug);
      toast.success(`${provider.name} restaurado ao padrão`);
    } else {
      setOverride(provider.slug, patch);
      toast.success(`${provider.name} atualizado`);
    }
    onClose();
  };

  const reset = () => {
    resetOverride(provider.slug);
    setColor(provider.color || "#ffffff");
    setCustomSvg("");
    setCustomUrl("");
    setPalette(KNOWN_BRAND_PALETTES[provider.slug] || [provider.color || "#ffffff"]);
    toast.success("Override removido");
  };

  // Preview ephemeral (não persiste até salvar) — usa override temporário inline
  const previewOverride: LogoOverride = {
    color: color || provider.color,
    customSvg: tab === "svg" ? customSvg : undefined,
    customUrl: tab === "url" ? customUrl : undefined,
    palette: tab === "palette" ? palette : undefined,
    updatedAt: 0,
  };

  const previewTokens = buildBrandTokens(
    tab === "palette" && palette.length ? palette : [color || provider.color || "#ffffff"],
    provider.color,
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-stretch sm:items-center justify-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full sm:max-w-3xl bg-[#0a0a0a] sm:rounded-2xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-full sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-5 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
                  <Sparkles className="w-3 h-3" /> Logo Editor
                </div>
                <h2 className="text-xl font-bold mt-1">{provider.name}</h2>
                <p className="text-xs text-white/50">slug: {provider.slug}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
            </header>

            {/* Live preview */}
            <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Preview ao vivo</p>
              <div className="flex items-end gap-4 flex-wrap">
                {PREVIEW_VARIANTS.map((v) => (
                  <PreviewTile key={v} variant={v} provider={provider} override={previewOverride} />
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-4 flex gap-1">
              {([
                ["color", "Cor", Paintbrush],
                ["svg", "SVG inline", Code2],
                ["url", "URL externa", Link2],
              ] as const).map(([k, label, Icon]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider rounded-t-lg border-b-2 transition-colors ${
                    tab === k ? "text-white border-white" : "text-white/50 border-transparent hover:text-white/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            <div className="px-5 py-4 flex-1 overflow-y-auto space-y-3">
              {tab === "color" && (
                <div className="space-y-3">
                  <p className="text-xs text-white/60">Cor de marca usada no glow, fundo gradiente e tint do glifo.</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color || "#ffffff"}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-12 rounded-lg bg-transparent border border-white/15 cursor-pointer"
                    />
                    <input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#RRGGBB"
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-white/30"
                    />
                    <button
                      onClick={() => setColor(provider.color || "#ffffff")}
                      className="px-3 py-2 text-xs uppercase tracking-wider border border-white/10 rounded-lg hover:bg-white/5"
                    >
                      Padrão
                    </button>
                  </div>
                </div>
              )}
              {tab === "svg" && (
                <div className="space-y-2">
                  <p className="text-xs text-white/60">
                    Cole o <code className="text-white/80">&lt;svg&gt;</code> inline. Use <code className="text-white/80">currentColor</code> para herdar a cor da marca.
                  </p>
                  <textarea
                    value={customSvg}
                    onChange={(e) => setCustomSvg(e.target.value)}
                    rows={8}
                    placeholder='<svg viewBox="0 0 24 24" fill="currentColor"><path d="..." /></svg>'
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-white/30 resize-y"
                  />
                  {customSvg && !customSvg.trim().toLowerCase().startsWith("<svg") && (
                    <p className="text-xs text-amber-400">⚠ Conteúdo precisa começar com &lt;svg&gt;.</p>
                  )}
                </div>
              )}
              {tab === "url" && (
                <div className="space-y-2">
                  <p className="text-xs text-white/60">URL pública para uma imagem PNG/SVG hospedada (ex.: CDN do cliente).</p>
                  <input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://cdn.exemplo.com/logo.svg"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              )}
            </div>

            <footer className="p-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={reset}
                disabled={!current}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/10 disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restaurar padrão
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-xs uppercase tracking-wider border border-white/10 rounded-lg hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  disabled={!dirty}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PreviewTile({
  variant, provider, override,
}: { variant: LogoVariant; provider: CatalogProvider; override: LogoOverride }) {
  // Renderiza usando overrides aplicados temporariamente via prop "color" + slug fake quando há SVG/URL
  // O LogoRenderer lê overrides persistidos do storage, então aqui simulamos com slug temporário não-cacheado.
  // Truque: passamos a cor diretamente; para SVG/URL inline, renderizamos paralelo.
  return (
    <div className="flex flex-col items-center gap-1.5">
      {override.customSvg ? (
        <PreviewSvg svg={override.customSvg} color={override.color || provider.color} variant={variant} name={provider.name} />
      ) : override.customUrl ? (
        <PreviewImg url={override.customUrl} variant={variant} name={provider.name} />
      ) : (
        <LogoRenderer
          slug={provider.slug}
          color={override.color || provider.color}
          name={provider.name}
          variant={variant}
          glow
        />
      )}
      <span className="text-[9px] uppercase tracking-widest text-white/40">{variant}</span>
    </div>
  );
}

const VARIANT_PX: Record<LogoVariant, number> = {
  xs: 20, sm: 28, md: 40, lg: 56, xl: 80, card: 44, marketplace: 48, hero: 96, inline: 18,
};

function PreviewSvg({ svg, color, variant, name }: { svg: string; color?: string; variant: LogoVariant; name: string }) {
  const px = VARIANT_PX[variant];
  return (
    <div
      aria-label={name}
      className="rounded-xl border flex items-center justify-center overflow-hidden"
      style={{
        width: px, height: px,
        background: "linear-gradient(135deg, #1a1a1a, #050505)",
        borderColor: `${color || "#fff"}55`,
        boxShadow: `0 0 24px ${color || "#fff"}22 inset`,
        color: color || "#fff",
      }}
    >
      <span
        style={{ width: px * 0.62, height: px * 0.62, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

function PreviewImg({ url, variant, name }: { url: string; variant: LogoVariant; name: string }) {
  const px = VARIANT_PX[variant];
  return (
    <div
      className="rounded-xl border border-white/10 flex items-center justify-center overflow-hidden"
      style={{ width: px, height: px, background: "linear-gradient(135deg, #1a1a1a, #050505)" }}
    >
      <img src={url} alt={name} width={px * 0.62} height={px * 0.62} className="object-contain" />
    </div>
  );
}
