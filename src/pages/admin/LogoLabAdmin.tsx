/**
 * 🧪 LogoLab — Playground oficial do LogoRenderer
 * Visualiza todas as variantes, glow on/off, bare e o catálogo completo.
 */
import { useMemo, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import LogoRenderer, { type LogoVariant } from "@/components/ui/logo/LogoRenderer";
import { PROVIDER_CATALOG, CATEGORY_LABEL, type ProviderCategory } from "@/modules/integrations/providerCatalog";
import { Sparkles, Search } from "lucide-react";

const VARIANTS: LogoVariant[] = ["xs", "sm", "md", "lg", "xl", "card", "marketplace", "hero", "inline"];

export default function LogoLabAdmin() {
  const [variant, setVariant] = useState<LogoVariant>("card");
  const [glow, setGlow] = useState(true);
  const [bare, setBare] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ProviderCategory | "all">("all");

  const filtered = useMemo(() => {
    return PROVIDER_CATALOG.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat]);

  return (
    <AdminPageShell
      title="LogoLab"
      subtitle="Playground oficial do LogoRenderer — variantes, glow, bare e catálogo completo"
      actions={
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-[10px] uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3" /> {filtered.length} providers
        </span>
      }
    >
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
              <span className="text-white/80">Bare (sem bg/borda)</span>
            </label>
          </div>
        </div>

        {/* Live preview */}
        <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent min-w-[200px] flex flex-col items-center justify-center gap-3">
          <LogoRenderer slug="github" color="#ffffff" name="GitHub" variant={variant} glow={glow} bare={bare} />
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Preview</p>
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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="group p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/25 transition-all flex flex-col items-center gap-3"
          >
            <LogoRenderer slug={p.slug} color={p.color} name={p.name} variant={variant} glow={glow} bare={bare} />
            <div className="text-center min-w-0 w-full">
              <p className="text-xs font-semibold truncate">{p.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">{CATEGORY_LABEL[p.category]}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/40">Nenhum provider encontrado.</div>
      )}
    </AdminPageShell>
  );
}
