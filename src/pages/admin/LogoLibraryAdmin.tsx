/**
 * 📚 LogoLibraryAdmin — Biblioteca oficial de logos com editor
 * Catálogo completo + busca + filtro + indicador de "customizado" + editor inline.
 */
import { useMemo, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LogoRenderer from "@/components/ui/logo/LogoRenderer";
import LogoEditorModal from "@/modules/branding/LogoEditorModal";
import { PROVIDER_CATALOG, CATEGORY_LABEL, type CatalogProvider, type ProviderCategory } from "@/modules/integrations/providerCatalog";
import { useLogoOverrides } from "@/hooks/useLogoOverrides";
import { Search, Pencil, Sparkles, RotateCcw, Star } from "lucide-react";

function LogoLibraryInner() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ProviderCategory | "all">("all");
  const [onlyCustom, setOnlyCustom] = useState(false);
  const [editing, setEditing] = useState<CatalogProvider | null>(null);
  const { overrides, count, resetAll } = useLogoOverrides();

  const filtered = useMemo(() => {
    return PROVIDER_CATALOG.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (onlyCustom && !overrides[p.slug]) return false;
      if (q && !(p.name + p.slug).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat, onlyCustom, overrides]);

  return (
    <AdminPageShell
      title="Logo Library"
      subtitle="Biblioteca enterprise de logos. Edite cor, cole SVG ou aponte para uma URL — preview em todas as variantes."
      actions={
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-[10px] uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" /> {PROVIDER_CATALOG.length} providers
          </span>
          {count > 0 && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 text-[10px] uppercase tracking-[0.2em]">
              <Star className="w-3 h-3 fill-amber-300" /> {count} customizadas
            </span>
          )}
          {count > 0 && (
            <button
              onClick={() => { if (confirm("Remover TODAS as customizações de logo?")) resetAll(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider border border-red-500/30 text-red-300 rounded-full hover:bg-red-500/10"
            >
              <RotateCcw className="w-3 h-3" /> Reset all
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar provider ou slug..."
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
        <button
          onClick={() => setOnlyCustom((v) => !v)}
          className={`px-3 py-2 text-[10px] uppercase tracking-wider rounded-lg border whitespace-nowrap inline-flex items-center gap-1.5 ${
            onlyCustom ? "bg-amber-400 text-black border-amber-400" : "border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
          }`}
        >
          <Star className={`w-3 h-3 ${onlyCustom ? "fill-black" : "fill-amber-300"}`} />
          Só customizadas
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((p) => {
          const isCustom = !!overrides[p.slug];
          return (
            <div
              key={p.id}
              className={`group relative p-4 rounded-2xl border bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center gap-3 ${
                isCustom ? "border-amber-400/40" : "border-white/10 hover:border-white/25"
              }`}
            >
              {isCustom && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  <Star className="w-2.5 h-2.5 fill-amber-300" /> custom
                </span>
              )}
              <LogoRenderer slug={p.slug} color={p.color} name={p.name} variant="card" glow />
              <div className="text-center min-w-0 w-full">
                <p className="text-xs font-semibold truncate">{p.name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">{CATEGORY_LABEL[p.category]}</p>
              </div>
              <button
                onClick={() => setEditing(p)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] uppercase tracking-wider rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Editar
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/40 border border-white/10 rounded-xl">
          Nenhum provider encontrado.
        </div>
      )}

      <LogoEditorModal open={!!editing} provider={editing} onClose={() => setEditing(null)} />
    </AdminPageShell>
  );
}

export default function LogoLibraryAdmin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <LogoLibraryInner />
    </ProtectedRoute>
  );
}
