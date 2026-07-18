/**
 * 🏗️ SiteCreationAdmin — CMS para /criacao-de-sites-profissionais
 * Gerencia config, hero, SEO, seções e diagnósticos.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useSitePage, updateSitePageConfig, createSitePageVersion } from "@/hooks/useSitePage";
import { useToast } from "@/hooks/use-toast";
import { Save, ExternalLink, History, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function SiteCreationAdmin() {
  const { data, loading, reload } = useSitePage();
  const { toast } = useToast();
  const [tab, setTab] = useState<"hero" | "seo" | "diag" | "counts">("hero");
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
    else { toast({ title: `${label} salvo` }); reload(); }
  };

  const snapshot = async () => {
    const label = prompt("Nome da versão (snapshot):", `v-${new Date().toISOString().slice(0,10)}`);
    if (!label) return;
    const { error, version } = await createSitePageVersion(label);
    if (error) toast({ title: "Erro no snapshot", variant: "destructive" });
    else toast({ title: `Snapshot v${version} criado` });
  };

  const Field = ({ label, value, onChange, type = "text", rows }: any) => (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/60 mb-1.5 block">{label}</span>
      {rows ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none" />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/40 outline-none" />
      )}
    </label>
  );

  return (
    <AdminPageShell
      title="Criação de Sites"
      subtitle="CMS da página /criacao-de-sites-profissionais"
      actions={
        <>
          <Link to="/criacao-de-sites-profissionais" target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 text-xs uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> Pré-visualizar <ExternalLink className="w-3 h-3" />
          </Link>
          <button onClick={snapshot}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 text-xs uppercase tracking-wider">
            <History className="w-3.5 h-3.5" /> Snapshot
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center gap-2 text-white/60"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap border-b border-white/10">
            {[
              { id: "hero", label: "Hero" },
              { id: "seo", label: "SEO" },
              { id: "diag", label: "Diagnóstico" },
              { id: "counts", label: "Conteúdo" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`px-4 py-2 text-xs uppercase tracking-wider border-b-2 transition ${
                  tab === t.id ? "border-white text-white" : "border-transparent text-white/50 hover:text-white"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "hero" && (
            <div className="space-y-4">
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
              <div className="flex gap-4 text-sm">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={hero.show_metrics !== false} onChange={(e) => setHero({ ...hero, show_metrics: e.target.checked })} /> Mostrar métricas</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={hero.show_project !== false} onChange={(e) => setHero({ ...hero, show_project: e.target.checked })} /> Mostrar mockup 3D</label>
              </div>
              <button disabled={saving} onClick={() => save({ hero_config: hero }, "Hero")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Hero
              </button>
            </div>
          )}

          {tab === "seo" && (
            <div className="space-y-4">
              <Field label="Title" value={seo.title} onChange={(v: string) => setSeo({ ...seo, title: v })} />
              <Field label="Description" rows={3} value={seo.description} onChange={(v: string) => setSeo({ ...seo, description: v })} />
              <Field label="Keywords" value={seo.keywords} onChange={(v: string) => setSeo({ ...seo, keywords: v })} />
              <Field label="Canonical" value={seo.canonical} onChange={(v: string) => setSeo({ ...seo, canonical: v })} />
              <button disabled={saving} onClick={() => save({ seo }, "SEO")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar SEO
              </button>
            </div>
          )}

          {tab === "diag" && (
            <div className="space-y-4">
              <Field label="Título do modal" value={diag.title} onChange={(v: string) => setDiag({ ...diag, title: v })} />
              <Field label="Descrição do modal" rows={2} value={diag.description} onChange={(v: string) => setDiag({ ...diag, description: v })} />
              <Field label="Texto de consentimento LGPD" rows={2} value={diag.consent_text} onChange={(v: string) => setDiag({ ...diag, consent_text: v })} />
              <Field label="URL de redirect pós-envio" value={diag.redirect_url} onChange={(v: string) => setDiag({ ...diag, redirect_url: v })} />
              <button disabled={saving} onClick={() => save({ diagnostico: diag }, "Diagnóstico")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Diagnóstico
              </button>
            </div>
          )}

          {tab === "counts" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ["Métricas", data.metrics.length],
                ["Diferenciais", data.differentials.length],
                ["Processo (steps)", data.process.length],
                ["Comparativo (linhas)", data.comparison.length],
                ["ROI (métricas)", data.roi.length],
                ["Projetos vinculados", data.projects.length],
                ["Tech stack", data.tech.length],
                ["FAQs vinculadas", data.faqs.length],
              ].map(([label, n]) => (
                <div key={label as string} className="p-5 rounded-xl border border-white/10 bg-white/5">
                  <div className="text-3xl font-bold">{n as number}</div>
                  <div className="text-xs uppercase tracking-wider text-white/60 mt-1">{label as string}</div>
                </div>
              ))}
              <p className="md:col-span-2 lg:col-span-3 text-xs text-white/50 mt-2">
                💡 A edição visual detalhada de cada seção (drag-and-drop, override por linha) chega na próxima fase — os dados atuais já vieram do seed inicial e estão sendo consumidos pela página pública.
              </p>
            </div>
          )}
        </div>
      )}
    </AdminPageShell>
  );
}
