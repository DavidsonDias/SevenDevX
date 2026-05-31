/**
 * 🧠 IntegrationMarketplaceModal — Catálogo enterprise com branding real
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Search, Plus, Sparkles, BookOpen, Zap, Webhook, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useScrollLock } from "@/hooks/useScrollLock";
import LogoRenderer from "@/components/ui/logo/LogoRenderer";
import BorderBeam from "@/components/ui/BorderBeam";
import { PROVIDER_CATALOG, CATEGORY_LIST, BADGE_META, type CatalogProvider } from "./providerCatalog";

export default function IntegrationMarketplaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useScrollLock(open);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [tab, setTab] = useState<"catalog" | "custom">("catalog");
  const [custom, setCustom] = useState({ id: "", name: "", category: "automacao", description: "", baseUrl: "" });
  const [adding, setAdding] = useState<string | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);

  const items = PROVIDER_CATALOG.filter(
    (i) => (cat === "all" || i.category === cat) && (!q || (i.name + i.description + i.tagline).toLowerCase().includes(q.toLowerCase())),
  );

  const add = async (item: CatalogProvider) => {
    setAdding(item.id);
    const { error } = await supabase.from("integration_providers" as any).upsert({
      id: item.id, name: item.name, category: item.category, description: item.description,
      color: item.color, icon: item.slug,
      is_connected: false, is_active: false, health_status: "unknown",
      secret_refs: item.secrets, config: { docs: item.docs, slug: item.slug },
    } as any);
    setAdding(null);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["integrations"] });
    qc.invalidateQueries({ queryKey: ["integration_providers"] });
    toast.success(`${item.name} adicionada ao seu workspace`);
    onClose();
  };

  const addCustom = async () => {
    if (!custom.id || !custom.name) return toast.error("ID e nome obrigatórios");
    setAddingCustom(true);
    const safeId = custom.id.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    const { error } = await supabase.from("integration_providers" as any).insert({
      id: safeId,
      name: custom.name, category: custom.category, description: custom.description,
      color: "#8B5CF6", is_connected: false, is_active: false, health_status: "unknown",
      config: { base_url: custom.baseUrl, custom: true, slug: safeId },
    } as any);
    setAddingCustom(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["integrations"] });
    qc.invalidateQueries({ queryKey: ["integration_providers"] });
    toast.success("Integração customizada criada");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-stretch sm:items-center justify-center sm:p-6"
          onClick={onClose}>
          <motion.div initial={{ y: 30, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full sm:max-w-6xl h-full sm:h-[min(900px,90vh)] bg-[#0a0a0a] sm:rounded-2xl border border-white/10 flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-5 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                    <Sparkles className="w-3.5 h-3.5" /> Integration Marketplace
                  </div>
                  <h2 className="text-2xl font-bold mt-1">Conecte seu ecossistema</h2>
                  <p className="text-sm text-white/50 mt-1">
                    {PROVIDER_CATALOG.length} providers enterprise prontos para conectar.
                  </p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-1 mt-4">
                {(["catalog", "custom"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-lg border ${tab === t ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
                    {t === "catalog" ? "Catálogo oficial" : "Customizada"}
                  </button>
                ))}
              </div>
            </header>

            {tab === "catalog" ? (
              <>
                <div className="p-4 border-b border-white/5 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar provider (ex: stripe, github)…"
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 overflow-x-auto">
                    {CATEGORY_LIST.map(([k, label]) => (
                      <button key={k} onClick={() => setCat(k as string)}
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded border whitespace-nowrap ${cat === k ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
                  {items.map((i) => (
                    <motion.div
                      key={i.id}
                      whileHover={{ y: -3 }}
                      className="group relative min-h-[162px] p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04] transition-all flex flex-col gap-3 overflow-hidden"
                    >
                      {/* Glow contextual */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ background: `radial-gradient(circle at top right, ${i.color}22, transparent 60%)` }}
                      />
                      {/* Brand-aware orbiting beam on hover */}
                      <BorderBeam hoverOnly size={160} duration={5.5} colorFrom="transparent" colorTo={i.color} />

                      <div className="relative flex items-start gap-3">
                        <LogoRenderer slug={i.slug} color={i.color} name={i.name} variant="card" glow />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{i.name}</h4>
                            {i.tagline && <span className="hidden sm:inline text-[9px] uppercase tracking-wider text-white/40 truncate">· {i.tagline}</span>}
                          </div>
                          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{i.description}</p>
                        </div>
                      </div>

                      <div className="relative flex flex-wrap gap-1.5">
                        {(i.badges ?? []).map((b) => (
                          <span key={b} className={`inline-flex items-center text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${BADGE_META[b].cls}`}>
                            {BADGE_META[b].label}
                          </span>
                        ))}
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <Zap className="w-2.5 h-2.5" /> teste guiado
                        </span>
                        {i.hasWebhook && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            <Webhook className="w-2.5 h-2.5" /> webhook
                          </span>
                        )}
                        {i.hasOAuth && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                            <Key className="w-2.5 h-2.5" /> oauth
                          </span>
                        )}
                      </div>

                      <div className="relative flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => add(i)}
                          disabled={adding === i.id}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" /> {adding === i.id ? "Adicionando…" : "Conectar"}
                        </button>
                        <a
                          href={i.docs}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center px-2.5 py-2 rounded-lg border border-white/15 hover:bg-white/5 text-white/70"
                          title="Documentação oficial"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <p className="sm:col-span-2 lg:col-span-3 text-center text-white/40 text-sm py-12">Nenhum resultado.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
                  <LogoRenderer slug={custom.id || "custom"} color="#8B5CF6" name={custom.name || "Custom"} variant="card" glow />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Preview</p>
                    <p className="text-sm font-semibold truncate">{custom.name || "Sua integração"}</p>
                    <p className="text-[11px] text-white/50 truncate">{custom.baseUrl || "https://api.exemplo.com"}</p>
                  </div>
                </div>
                <p className="text-sm text-white/60">Conecte qualquer API REST ou Webhook customizado.</p>
                <input value={custom.id} onChange={(e) => setCustom({ ...custom, id: e.target.value })}
                  placeholder="ID único (ex: minha_api)"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                  placeholder="Nome de exibição"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <select value={custom.category} onChange={(e) => setCustom({ ...custom, category: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30">
                  {CATEGORY_LIST.slice(1).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <input value={custom.baseUrl} onChange={(e) => setCustom({ ...custom, baseUrl: e.target.value })}
                  placeholder="Base URL da API (https://…)"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <textarea value={custom.description} onChange={(e) => setCustom({ ...custom, description: e.target.value })}
                  placeholder="Descrição curta" rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <button onClick={addCustom} disabled={addingCustom}
                  className="w-full px-4 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 disabled:opacity-50">
                  {addingCustom ? "Criando…" : "Criar integração customizada"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
