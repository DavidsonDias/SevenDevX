/**
 * 🚀 PortfolioAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/PortfolioAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/portfolio
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Console do Portfólio Davidson: define quais projetos do SevenOS são
 * publicados no site pessoal, sua ordem e destaque, e edita o conteúdo
 * de perfil/hero servido pela API pública `portfolio-content`.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS
 * 🔒 Somente projetos com status `published` aparecem na API pública
 *
 * @updated 2026-08-05
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useMemo, useState, useEffect } from "react";
import {
  Globe, Star, Copy, Check, ExternalLink, Loader2, Save, Eye, EyeOff, ArrowUp, ArrowDown,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import {
  usePortfolioProjects, useUpdatePortfolioProject, usePortfolioSettings,
  useUpdatePortfolioSettings, PORTFOLIO_API_URL, type PortfolioProject,
} from "@/hooks/usePortfolio";

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

const Field = ({ label, value, onChange, textarea }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-background/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground/40 transition-colors"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground/40 transition-colors"
      />
    )}
  </label>
);

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function PortfolioAdmin() {
  const { toast } = useToast();
  const { data: projects = [], isLoading } = usePortfolioProjects();
  const updateProject = useUpdatePortfolioProject();
  const { data: settings } = usePortfolioSettings();
  const updateSettings = useUpdatePortfolioSettings();

  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", headline: "", bio: "", email: "", github: "", linkedin: "" });

  useEffect(() => {
    if (!settings) return;
    setForm({
      name: settings.profile?.name ?? "",
      role: settings.profile?.role ?? "",
      headline: settings.hero?.headline ?? "",
      bio: settings.about?.bio ?? "",
      email: settings.profile?.email ?? "",
      github: settings.profile?.github ?? "",
      linkedin: settings.profile?.linkedin ?? "",
    });
  }, [settings]);

  const enabled = useMemo(() => projects.filter((p) => p.portfolio_enabled), [projects]);

  const toggle = (p: PortfolioProject) =>
    updateProject.mutate(
      { id: p.id, patch: { portfolio_enabled: !p.portfolio_enabled } },
      { onError: () => toast({ title: "Falha ao atualizar", variant: "destructive" }) },
    );

  const move = (p: PortfolioProject, dir: -1 | 1) =>
    updateProject.mutate({ id: p.id, patch: { portfolio_order: (p.portfolio_order ?? 0) + dir } });

  const saveSettings = () =>
    updateSettings.mutate(
      {
        profile: { name: form.name, role: form.role, email: form.email, github: form.github, linkedin: form.linkedin },
        hero: { ...(settings?.hero ?? {}), headline: form.headline },
        about: { ...(settings?.about ?? {}), bio: form.bio },
      },
      {
        onSuccess: () => toast({ title: "Conteúdo do portfólio salvo" }),
        onError: () => toast({ title: "Falha ao salvar", variant: "destructive" }),
      },
    );

  const copyUrl = async () => {
    await navigator.clipboard.writeText(PORTFOLIO_API_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminPageShell
      title="Portfólio Davidson"
      subtitle="CMS headless do site pessoal — alimentado pelo SevenOS"
    >
      <div className="space-y-6">
        {/* Endpoint público */}
        <GlassCard className="p-5">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider">API pública de conteúdo</h2>
              <p className="text-xs text-muted-foreground">
                O site do portfólio consome este endpoint (somente leitura, cache de 5 min na CDN).
                Nenhuma credencial é necessária.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-[11px] bg-background/50 border border-border rounded px-2 py-1.5 break-all">
                  GET {PORTFOLIO_API_URL}
                </code>
                <button
                  onClick={copyUrl}
                  className="inline-flex items-center gap-1.5 text-xs border border-border rounded px-2.5 py-1.5 hover:bg-foreground/5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <a
                  href={PORTFOLIO_API_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs border border-border rounded px-2.5 py-1.5 hover:bg-foreground/5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Testar
                </a>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Retorna: <span className="font-mono">profile · hero · about · links · skills · projects · tech · posts</span>
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Conteúdo do site */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Conteúdo do site</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings.mutate({ is_published: !(settings?.is_published ?? true) })}
                className="inline-flex items-center gap-1.5 text-xs border border-border rounded px-2.5 py-1.5 hover:bg-foreground/5 transition-colors"
              >
                {settings?.is_published === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {settings?.is_published === false ? "Despublicado" : "Publicado"}
              </button>
              <button
                onClick={saveSettings}
                disabled={updateSettings.isPending}
                className="inline-flex items-center gap-1.5 text-xs border border-foreground/30 rounded px-3 py-1.5 hover:bg-foreground/5 transition-colors disabled:opacity-50"
              >
                {updateSettings.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Salvar
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Cargo / Papel" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
            <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="GitHub" value={form.github} onChange={(v) => setForm({ ...form, github: v })} />
            <Field label="LinkedIn" value={form.linkedin} onChange={(v) => setForm({ ...form, linkedin: v })} />
            <Field label="Headline do hero" value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} />
            <div className="sm:col-span-2">
              <Field label="Bio (sobre)" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} textarea />
            </div>
          </div>
        </GlassCard>

        {/* Seleção de projetos */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Projetos no portfólio</h2>
            <span className="text-xs text-muted-foreground">{enabled.length} publicados de {projects.length}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando projetos…
            </div>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    p.portfolio_enabled ? "border-foreground/25 bg-foreground/[0.03]" : "border-border"
                  }`}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-background/50 border border-border shrink-0">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {p.category || "sem categoria"} · {p.status}
                      {p.status !== "published" && p.portfolio_enabled ? " · não sairá na API" : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => updateProject.mutate({ id: p.id, patch: { portfolio_highlight: !p.portfolio_highlight } })}
                    aria-label="Destacar projeto"
                    className={`p-1.5 rounded border transition-colors ${
                      p.portfolio_highlight ? "border-foreground/40 text-foreground" : "border-border text-muted-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" fill={p.portfolio_highlight ? "currentColor" : "none"} />
                  </button>

                  <div className="flex flex-col">
                    <button onClick={() => move(p, -1)} aria-label="Subir" className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => move(p, 1)} aria-label="Descer" className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggle(p)}
                    className={`text-[11px] uppercase tracking-wider border rounded px-2.5 py-1.5 transition-colors ${
                      p.portfolio_enabled
                        ? "border-foreground/30 hover:bg-foreground/5"
                        : "border-border text-muted-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {p.portfolio_enabled ? "No portfólio" : "Adicionar"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </AdminPageShell>
  );
}
