/**
 * SiteCreationAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/SiteCreationAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/site-creation
 *
 * @description
 * CMS da landing de criação de sites (seções, projetos, stack e SEO).
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🏗️ SiteCreationAdmin — CMS premium para /criacao-de-sites-profissionais
 * Layout enterprise, mobile-first, tabs com ícones, status card e ações persistentes.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useSitePage, updateSitePageConfig, createSitePageVersion } from "@/hooks/useSitePage";
import { useToast } from "@/hooks/use-toast";
import {
  Save, ExternalLink, History, Eye, Loader2, Sparkles, Layers, Cpu, Search,
  MessagesSquare, BarChart3, CheckCircle2, Clock, Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import SiteCreationProjectsTab from "@/components/admin/SiteCreationProjectsTab";
import SiteCreationTechTab from "@/components/admin/SiteCreationTechTab";

type TabId = "hero" | "projects" | "tech" | "seo" | "diag" | "counts";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "hero", label: "Hero", icon: Sparkles },
  { id: "projects", label: "Projetos", icon: Layers },
  { id: "tech", label: "Tecnologias", icon: Cpu },
  { id: "seo", label: "SEO", icon: Search },
  { id: "diag", label: "Diagnóstico", icon: MessagesSquare },
  { id: "counts", label: "Conteúdo", icon: BarChart3 },
];

function Field({ label, value, onChange, type = "text", rows }: any) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-1.5 block font-semibold">{label}</span>
      {rows ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows}
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 focus:bg-white/[0.07] outline-none transition" />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 focus:bg-white/[0.07] outline-none transition" />
      )}
    </label>
  );
}

function SaveButton({ saving, onClick, children }: any) {
  return (
    <button disabled={saving} onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-white to-white/90 text-black text-xs uppercase tracking-wider font-bold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-white/10">
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {children}
    </button>
  );
}

export default function SiteCreationAdmin() {
  const { data, loading, reload } = useSitePage();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("hero");
  const [saving, setSaving] = useState(false);
  const [hero, setHero] = useState<any>({});
  const [seo, setSeo] = useState<any>({});
  const [diag, setDiag] = useState<any>({});

  useEffect(() => {
    if (data.config) {
      setHero(data.config.hero_config || {});
      setSeo(data.config.seo || {});
      setDiag(data.config.diagnostico || {});
    }
  }, [data.config]);

  const save = async (patch: any, label: string) => {
    setSaving(true);
    const { error } = await updateSitePageConfig(patch);
    setSaving(false);
    if (error) toast({ title: "Erro ao salvar", variant: "destructive" });
    else { toast({ title: `${label} salvo com sucesso` }); reload(); }
  };

  const snapshot = async () => {
    const label = prompt("Nome da versão (snapshot):", `v-${new Date().toISOString().slice(0, 10)}`);
    if (!label) return;
    const { error, version } = await createSitePageVersion(label);
    if (error) toast({ title: "Erro no snapshot", variant: "destructive" });
    else toast({ title: `Snapshot v${version} criado` });
  };

  const status = data.config?.page_status || "draft";
  const lastPub = data.config?.last_published_at;

  const totals = useMemo(() => [
    { label: "Métricas", n: data.metrics.length, icon: BarChart3 },
    { label: "Diferenciais", n: data.differentials.length, icon: Sparkles },
    { label: "Processo", n: data.process.length, icon: Layers },
    { label: "Comparativo", n: data.comparison.length, icon: BarChart3 },
    { label: "ROI", n: data.roi.length, icon: BarChart3 },
    { label: "Projetos", n: data.projects.length, icon: Layers },
    { label: "Tech stack", n: data.tech.length, icon: Cpu },
    { label: "FAQs", n: data.faqs.length, icon: MessagesSquare },
  ], [data]);

  return (
    <AdminPageShell
      title="Criação de Sites"
      subtitle="CMS · /criacao-de-sites-profissionais"
      actions={
        <>
          <Link to="/criacao-de-sites-profissionais" target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 text-xs uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Pré-visualizar</span> <ExternalLink className="w-3 h-3" />
          </Link>
          <button onClick={snapshot}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 text-xs uppercase tracking-wider">
            <History className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Snapshot</span>
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center gap-2 text-white/60 py-10"><Loader2 className="w-4 h-4 animate-spin" /> Carregando CMS…</div>
      ) : (
        <div className="space-y-6">
          {/* Status Hero Card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-5 sm:p-6">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                      status === "published" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {status === "published" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                    {lastPub && <span className="text-[10px] text-white/50 uppercase tracking-wider">
                      Última publicação: {new Date(lastPub).toLocaleString("pt-BR")}
                    </span>}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mt-1">Página comercial · Criação de Sites</h2>
                  <p className="text-xs text-white/60 mt-0.5">Gerencie hero, projetos, stack, SEO e captação de leads.</p>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 shrink-0">
                {[
                  { n: data.projects.length, l: "Proj." },
                  { n: data.tech.length, l: "Tech" },
                  { n: data.metrics.length, l: "Métr." },
                  { n: data.faqs.length, l: "FAQs" },
                ].map((s) => (
                  <div key={s.l} className="text-center px-3 py-2 rounded-lg bg-white/5 border border-white/10 min-w-[3rem]">
                    <div className="text-lg font-bold">{s.n}</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/50">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tabs — segmented, scrollable on mobile */}
          <div className="sticky top-16 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider whitespace-nowrap transition ${
                      active ? "bg-white text-black font-bold" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}>
                    <Icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            {tab === "hero" && (
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Badge texto" value={hero.badge_text} onChange={(v: string) => setHero({ ...hero, badge_text: v })} />
                  <Field label="Badge ano" value={hero.badge_year} onChange={(v: string) => setHero({ ...hero, badge_year: v })} />
                  <Field label="Título — prefixo" value={hero.title_prefix} onChange={(v: string) => setHero({ ...hero, title_prefix: v })} />
                  <Field label="Título — destaque (gradient)" value={hero.title_highlight} onChange={(v: string) => setHero({ ...hero, title_highlight: v })} />
                  <Field label="Título — sufixo" value={hero.title_suffix} onChange={(v: string) => setHero({ ...hero, title_suffix: v })} />
                  <Field label="CTA primário — label" value={hero.cta_primary_label} onChange={(v: string) => setHero({ ...hero, cta_primary_label: v })} />
                  <Field label="CTA primário — ação (diagnostico | link)" value={hero.cta_primary_action} onChange={(v: string) => setHero({ ...hero, cta_primary_action: v })} />
                  <Field label="CTA primário — URL (se link)" value={hero.cta_primary_url} onChange={(v: string) => setHero({ ...hero, cta_primary_url: v })} />
                  <Field label="CTA secundário — label" value={hero.cta_secondary_label} onChange={(v: string) => setHero({ ...hero, cta_secondary_label: v })} />
                  <Field label="CTA secundário — URL" value={hero.cta_secondary_url} onChange={(v: string) => setHero({ ...hero, cta_secondary_url: v })} />
                </div>
                <Field label="Descrição" rows={3} value={hero.description} onChange={(v: string) => setHero({ ...hero, description: v })} />
                <div className="flex gap-4 text-sm flex-wrap">
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={hero.show_metrics !== false} onChange={(e) => setHero({ ...hero, show_metrics: e.target.checked })} /> Mostrar métricas</label>
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={hero.show_project !== false} onChange={(e) => setHero({ ...hero, show_project: e.target.checked })} /> Mostrar mockup 3D</label>
                </div>
                <SaveButton saving={saving} onClick={() => save({ hero_config: hero }, "Hero")}>Salvar Hero</SaveButton>
              </div>
            )}

            {tab === "projects" && <SiteCreationProjectsTab />}
            {tab === "tech" && <SiteCreationTechTab />}

            {tab === "seo" && (
              <div className="space-y-4 max-w-3xl">
                <Field label="Title" value={seo.title} onChange={(v: string) => setSeo({ ...seo, title: v })} />
                <Field label="Description" rows={3} value={seo.description} onChange={(v: string) => setSeo({ ...seo, description: v })} />
                <Field label="Keywords" value={seo.keywords} onChange={(v: string) => setSeo({ ...seo, keywords: v })} />
                <Field label="Canonical" value={seo.canonical} onChange={(v: string) => setSeo({ ...seo, canonical: v })} />
                <SaveButton saving={saving} onClick={() => save({ seo }, "SEO")}>Salvar SEO</SaveButton>
              </div>
            )}

            {tab === "diag" && (
              <div className="space-y-4 max-w-3xl">
                <Field label="Título do modal" value={diag.title} onChange={(v: string) => setDiag({ ...diag, title: v })} />
                <Field label="Descrição do modal" rows={2} value={diag.description} onChange={(v: string) => setDiag({ ...diag, description: v })} />
                <Field label="Texto de consentimento LGPD" rows={2} value={diag.consent_text} onChange={(v: string) => setDiag({ ...diag, consent_text: v })} />
                <Field label="URL de redirect pós-envio" value={diag.redirect_url} onChange={(v: string) => setDiag({ ...diag, redirect_url: v })} />
                <SaveButton saving={saving} onClick={() => save({ diagnostico: diag }, "Diagnóstico")}>Salvar Diagnóstico</SaveButton>
              </div>
            )}

            {tab === "counts" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {totals.map((s) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={s.label} whileHover={{ y: -2 }}
                      className="relative overflow-hidden p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent">
                      <Icon className="w-4 h-4 text-white/40 absolute top-3 right-3" />
                      <div className="text-2xl sm:text-3xl font-bold">{s.n}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/60 mt-1">{s.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AdminPageShell>
  );
}
