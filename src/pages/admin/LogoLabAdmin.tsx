/**
 * 🧪 LogoLab — Playground oficial do LogoRenderer + Dynamic Brand Palette Engine
 * Mostra preview real do card de Integração, Marketplace e Hero usando a paleta
 * multicor extraída automaticamente.
 */
import { useMemo, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import LogoRenderer, { type LogoVariant } from "@/components/ui/logo/LogoRenderer";
import BrandHalo from "@/components/ui/BrandHalo";
import BorderBeam from "@/components/ui/BorderBeam";
import { PROVIDER_CATALOG, CATEGORY_LABEL, type ProviderCategory } from "@/modules/integrations/providerCatalog";
import { useBrandPalette } from "@/hooks/useBrandPalette";
import { Sparkles, Search, Plus, BookOpen, Settings } from "lucide-react";

const VARIANTS: LogoVariant[] = ["xs", "sm", "md", "lg", "xl", "card", "marketplace", "hero", "inline"];

function PalettePreview({ slug, name, fallback }: { slug: string; name: string; fallback: string }) {
  const tokens = useBrandPalette(slug, fallback);
  return (
    <div className="flex items-center gap-1.5">
      {tokens.palette.slice(0, 5).map((c, i) => (
        <span key={i} className="w-5 h-5 rounded-full ring-1 ring-white/20" style={{ background: c }} title={c} />
      ))}
      {tokens.isMulticolor && (
        <span className="text-[9px] uppercase tracking-wider text-emerald-300 ml-1">multi</span>
      )}
    </div>
  );
}

function IntegrationCardMock({ slug, name, description, fallback }: { slug: string; name: string; description: string; fallback: string }) {
  const tokens = useBrandPalette(slug, fallback);
  return (
    <div className="group relative">
      <GlassCard padding="md" hover={false} className="h-full flex flex-col gap-3.5 transition-all overflow-hidden relative">
        <BrandHalo tokens={tokens} alwaysOn />
        <div className="absolute inset-x-0 top-0 h-px opacity-80 pointer-events-none" style={{ background: tokens.topBorderGradient }} />
        {!tokens.isMulticolor && (
          <BorderBeam size={180} duration={6} colorFrom="transparent" colorTo={tokens.primary} />
        )}
        <div className="flex items-start gap-3 relative">
          <LogoRenderer slug={slug} color={tokens.primary} name={name} variant="card" glow />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold truncate">{name}</h4>
              <span className="text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded border border-emerald-400/40 text-emerald-300 bg-emerald-400/10">connected</span>
            </div>
            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-auto relative">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] uppercase tracking-wider rounded-lg border border-white/15">
            <Sparkles className="w-3.5 h-3.5" /> Testar
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] uppercase tracking-wider rounded-lg border border-white/15">
            <Settings className="w-3.5 h-3.5" /> Config
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

function MarketplaceCardMock({ slug, name, description, fallback }: { slug: string; name: string; description: string; fallback: string }) {
  const tokens = useBrandPalette(slug, fallback);
  return (
    <div className="group relative min-h-[162px] p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col gap-3 overflow-hidden">
      <BrandHalo tokens={tokens} alwaysOn />
      <div className="absolute inset-x-0 top-0 h-px opacity-80 pointer-events-none" style={{ background: tokens.topBorderGradient }} />
      {!tokens.isMulticolor && (
        <BorderBeam size={160} duration={5.5} colorFrom="transparent" colorTo={tokens.primary} />
      )}
      <div className="relative flex items-start gap-3">
        <LogoRenderer slug={slug} color={tokens.primary} name={name} variant="card" glow />
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold truncate">{name}</h4>
          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="relative flex items-center gap-2 mt-auto">
        <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium">
          <Plus className="w-3.5 h-3.5" /> Conectar
        </button>
        <button className="inline-flex items-center justify-center px-2.5 py-2 rounded-lg border border-white/15">
          <BookOpen className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function HeroPreview({ slug, name, fallback }: { slug: string; name: string; fallback: string }) {
  const tokens = useBrandPalette(slug, fallback);
  return (
    <div className="group relative rounded-2xl p-8 border border-white/10 bg-black/40 overflow-hidden">
      <BrandHalo tokens={tokens} alwaysOn intensity={2} />
      <div className="relative flex flex-col items-center gap-4">
        <LogoRenderer slug={slug} name={name} color={tokens.primary} variant="hero" glow />
        <h3 className="text-2xl font-bold">{name}</h3>
        <PalettePreview slug={slug} name={name} fallback={fallback} />
      </div>
    </div>
  );
}

export default function LogoLabAdmin() {
  const [variant, setVariant] = useState<LogoVariant>("card");
  const [glow, setGlow] = useState(true);
  const [bare, setBare] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ProviderCategory | "all">("all");
  const [selectedSlug, setSelectedSlug] = useState<string>("google");

  const filtered = useMemo(() => {
    return PROVIDER_CATALOG.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat]);

  const selected = PROVIDER_CATALOG.find((p) => p.slug === selectedSlug) || PROVIDER_CATALOG[0];

  return (
    <AdminPageShell
      title="LogoLab"
      subtitle="Playground do Dynamic Brand Palette Engine — paleta multicor, halo conic, beam contextual"
      actions={
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-[10px] uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3" /> {filtered.length} providers
        </span>
      }
    >
      {/* Live preview do provider selecionado */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Integration Card</p>
          <IntegrationCardMock slug={selected.slug} name={selected.name} description={selected.description} fallback={selected.color} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Marketplace Card</p>
          <MarketplaceCardMock slug={selected.slug} name={selected.name} description={selected.description} fallback={selected.color} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Hero / Detail</p>
          <HeroPreview slug={selected.slug} name={selected.name} fallback={selected.color} />
        </div>
      </div>

      {/* Controls */}
      <div className="grid lg:grid-cols-[1fr_auto] gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Variant</p>
            <div className="flex flex-wrap gap-1.5">
              {VARIANTS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] uppercase tracking-wider transition-colors ${
                    variant === v ? "bg-white text-black border-white" : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={glow} onChange={(e) => setGlow(e.target.checked)} className="accent-white" />
              <span className="text-white/80">Glow</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bare} onChange={(e) => setBare(e.target.checked)} className="accent-white" />
              <span className="text-white/80">Bare</span>
            </label>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent min-w-[200px] flex flex-col items-center justify-center gap-3">
          <LogoRenderer slug={selected.slug} color={selected.color} name={selected.name} variant={variant} glow={glow} bare={bare} />
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{selected.name}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar provider..."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as any)}
          className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
        >
          <option value="all">Todas categorias</option>
          {Object.entries(CATEGORY_LABEL).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grid clicável — seleciona o provider para preview acima */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedSlug(p.slug)}
            className={`group p-4 rounded-2xl border bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center gap-3 text-left ${
              selectedSlug === p.slug ? "border-white/40 ring-2 ring-white/30" : "border-white/10 hover:border-white/25"
            }`}
          >
            <LogoRenderer slug={p.slug} color={p.color} name={p.name} variant={variant} glow={glow} bare={bare} />
            <div className="text-center min-w-0 w-full">
              <p className="text-xs font-semibold truncate">{p.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">{CATEGORY_LABEL[p.category]}</p>
            </div>
            <PalettePreview slug={p.slug} name={p.name} fallback={p.color} />
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/40">Nenhum provider encontrado.</div>
      )}
    </AdminPageShell>
  );
}
