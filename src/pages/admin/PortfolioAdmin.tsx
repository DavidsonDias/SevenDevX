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
 * Console do Portfólio Davidson refatorado como CMS: shell de navegação
 * por áreas (visão geral, identidade, conteúdo, stack, carreira, projetos
 * e configurações), barra de publicação e listagens com edição em drawer.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS
 * 🔒 Somente projetos com status `published` aparecem na API pública
 * 🔒 Publicar salva o conteúdo e incrementa `content_version` (ETag da API)
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import {
  Globe, Copy, Check, ExternalLink, Loader2, Save, Eye, EyeOff, LayoutDashboard,
  UserCircle, FileText, Layers, Briefcase, FolderKanban, Settings2, Upload,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import PortfolioBlocksEditor, { type BlocksValue } from "@/components/admin/PortfolioBlocksEditor";
import type { CvData } from "@/components/admin/CvEditor";
import PortfolioDashboard from "@/components/admin/portfolio/PortfolioDashboard";
import StackAdmin from "@/components/admin/portfolio/StackAdmin";
import ProjectsAdmin from "@/components/admin/portfolio/ProjectsAdmin";
import CareerAdmin from "@/components/admin/portfolio/CareerAdmin";
import { Field } from "@/components/admin/portfolio/fields";
import type { SaveState } from "@/components/admin/portfolio/EditorDrawer";
import {
  usePortfolioSettings, useUpdatePortfolioSettings, PORTFOLIO_API_URL,
} from "@/hooks/usePortfolio";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

const AREAS = [
  { key: "overview", label: "Visão geral", icon: LayoutDashboard },
  { key: "identity", label: "Identidade", icon: UserCircle },
  { key: "content", label: "Conteúdo", icon: FileText },
  { key: "stack", label: "Stack", icon: Layers },
  { key: "career", label: "Carreira", icon: Briefcase },
  { key: "projects", label: "Projetos", icon: FolderKanban },
  { key: "settings", label: "Configurações", icon: Settings2 },
] as const;

type Area = (typeof AREAS)[number]["key"];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function PortfolioAdmin() {
  const { toast } = useToast();
  const { data: settings } = usePortfolioSettings();
  const updateSettings = useUpdatePortfolioSettings();

  const [area, setArea] = useState<Area>("overview");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", headline: "", bio: "", email: "", github: "", linkedin: "" });
  const [cv, setCv] = useState<CvData>({});
  const [blocks, setBlocks] = useState<BlocksValue>({});
  const [baseline, setBaseline] = useState("");
  const [state, setState] = useState<SaveState>("idle");

  useEffect(() => {
    if (!settings) return;
    const nextForm = {
      name: settings.profile?.name ?? "",
      role: settings.profile?.role ?? "",
      headline: settings.hero?.headline ?? "",
      bio: settings.about?.bio ?? "",
      email: settings.profile?.email ?? "",
      github: settings.profile?.github ?? "",
      linkedin: settings.profile?.linkedin ?? "",
    };
    const nextCv = (settings.cv ?? {}) as CvData;
    // 🔒 Somente os blocos editoriais entram no editor — nada de metadados.
    const nextBlocks: BlocksValue = {
      hero: settings.hero ?? {},
      about: settings.about ?? {},
      highlights: settings.highlights ?? [],
      skills: settings.skills ?? [],
      stats: settings.stats ?? [],
      navigation: settings.navigation ?? [],
      links: settings.links ?? [],
      services: settings.services ?? [],
      faqs: settings.faqs ?? [],
      contact: settings.contact ?? {},
      footer: settings.footer ?? {},
      seo: settings.seo ?? {},
      pwa: settings.pwa ?? {},
      flags: settings.flags ?? {},
    };
    setForm(nextForm);
    setCv(nextCv);
    setBlocks(nextBlocks);
    setBaseline(JSON.stringify({ nextForm, nextCv, nextBlocks }));
    setState("idle");
  }, [settings]);

  /** Alterações locais ainda não persistidas no banco. */
  const dirty = useMemo(
    () => baseline !== "" && baseline !== JSON.stringify({ nextForm: form, nextCv: cv, nextBlocks: blocks }),
    [baseline, form, cv, blocks],
  );

  /**
   * Persiste tudo em uma única escrita.
   *
   * 🔒 Nunca substitui um bloco inteiro: faz merge sobre o registro atual para
   *    não apagar campos que o editor não expõe.
   */
  const saveSettings = (publish = false) => {
    setState("saving");
    updateSettings.mutate(
      {
        ...blocks,
        profile: {
          ...(settings?.profile ?? {}),
          name: form.name,
          role: form.role,
          email: form.email,
          github: form.github,
          linkedin: form.linkedin,
        },
        hero: { ...(settings?.hero ?? {}), ...(blocks.hero ?? {}), headline: form.headline },
        about: { ...(settings?.about ?? {}), ...(blocks.about ?? {}), bio: form.bio },
        cv,
        ...(publish ? { content_version: (settings?.content_version ?? 0) + 1 } : {}),
      },
      {
        onSuccess: () => {
          setState("saved");
          toast({ title: publish ? "Portfólio publicado" : "Conteúdo salvo" });
        },
        onError: () => {
          setState("error");
          toast({ title: "Falha ao salvar", variant: "destructive" });
        },
      },
    );
  };

  const discard = () => {
    if (!settings) return;
    setBaseline("");
    // Reidrata a partir do último estado persistido.
    setForm({
      name: settings.profile?.name ?? "",
      role: settings.profile?.role ?? "",
      headline: settings.hero?.headline ?? "",
      bio: settings.about?.bio ?? "",
      email: settings.profile?.email ?? "",
      github: settings.profile?.github ?? "",
      linkedin: settings.profile?.linkedin ?? "",
    });
    setCv((settings.cv ?? {}) as CvData);
    setBlocks({
      hero: settings.hero ?? {}, about: settings.about ?? {}, highlights: settings.highlights ?? [],
      skills: settings.skills ?? [], stats: settings.stats ?? [], navigation: settings.navigation ?? [],
      links: settings.links ?? [], services: settings.services ?? [], faqs: settings.faqs ?? [],
      contact: settings.contact ?? {}, footer: settings.footer ?? {}, seo: settings.seo ?? {},
      pwa: settings.pwa ?? {}, flags: settings.flags ?? {},
    });
    setState("idle");
  };

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
      <div className="space-y-5">
        {/* ── Navegação por áreas ─────────────────────────────── */}
        <nav aria-label="Áreas do portfólio" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {AREAS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setArea(key)}
              aria-current={area === key ? "page" : undefined}
              className={`shrink-0 inline-flex items-center gap-1.5 min-h-11 rounded-full border px-4 text-[11px] uppercase tracking-wider transition-colors focus-visible:ring-1 focus-visible:ring-foreground/40 ${
                area === key ? "border-foreground bg-foreground/10" : "border-border text-muted-foreground hover:bg-foreground/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </nav>

        {/* ── Barra de publicação ─────────────────────────────── */}
        {dirty && (
          <div
            role="status"
            className="sticky top-2 z-20 rounded-xl border border-foreground/30 bg-background/80 backdrop-blur px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
          >
            <span className="text-xs uppercase tracking-wider">Alterações não publicadas</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="min-h-11" onClick={discard}>Descartar</Button>
              <Button variant="outline" size="sm" className="min-h-11" onClick={() => saveSettings(false)} disabled={state === "saving"}>
                {state === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
              </Button>
              <Button size="sm" className="min-h-11" onClick={() => saveSettings(true)} disabled={state === "saving"}>
                <Upload className="w-4 h-4" /> Publicar
              </Button>
            </div>
          </div>
        )}

        {/* ── VISÃO GERAL ─────────────────────────────────────── */}
        {area === "overview" && (
          <GlassCard className="p-4 sm:p-5">
            <PortfolioDashboard
              settings={settings ?? null}
              onNavigate={(k) => setArea((k === "seo" ? "content" : k) as Area)}
            />
          </GlassCard>
        )}

        {/* ── IDENTIDADE ──────────────────────────────────────── */}
        {area === "identity" && (
          <GlassCard className="p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Identidade</h2>
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
        )}

        {/* ── CONTEÚDO (blocos, SEO, PWA, flags) ──────────────── */}
        {area === "content" && (
          <GlassCard className="p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider">Blocos do site</h2>
              <p className="text-[11px] text-muted-foreground">
                Hero, sobre, destaques, números, navegação, redes, serviços, FAQ, contato,
                footer, SEO, PWA e feature flags — tudo servido pela API.
              </p>
            </div>
            <PortfolioBlocksEditor value={blocks} onChange={setBlocks} />
          </GlassCard>
        )}

        {/* ── STACK ───────────────────────────────────────────── */}
        {area === "stack" && (
          <GlassCard className="p-4 sm:p-5">
            <StackAdmin />
          </GlassCard>
        )}

        {/* ── CARREIRA ────────────────────────────────────────── */}
        {area === "career" && (
          <GlassCard className="p-4 sm:p-5">
            <CareerAdmin
              value={cv}
              onChange={setCv}
              onSave={() => saveSettings(false)}
              state={dirty && state !== "saving" ? "dirty" : state}
              dirty={dirty}
            />
          </GlassCard>
        )}

        {/* ── PROJETOS ────────────────────────────────────────── */}
        {area === "projects" && (
          <GlassCard className="p-4 sm:p-5">
            <ProjectsAdmin />
          </GlassCard>
        )}

        {/* ── CONFIGURAÇÕES ───────────────────────────────────── */}
        {area === "settings" && (
          <GlassCard className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider">API pública de conteúdo</h2>
                <p className="text-xs text-muted-foreground">
                  O site do portfólio consome este endpoint (somente leitura, cache de 5 min na CDN).
                  Nenhuma credencial é necessária.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-[11px] bg-background/50 border border-border rounded px-2 py-1.5 break-all">
                    GET {PORTFOLIO_API_URL}
                  </code>
                  <Button variant="outline" size="sm" className="min-h-11" onClick={copyUrl}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button asChild variant="outline" size="sm" className="min-h-11">
                    <a href={PORTFOLIO_API_URL} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" /> Testar
                    </a>
                  </Button>
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    onClick={() => updateSettings.mutate({ is_published: !(settings?.is_published ?? true) })}
                  >
                    {settings?.is_published === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {settings?.is_published === false ? "Despublicado" : "Publicado"}
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    Versão do conteúdo: {settings?.content_version ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </AdminPageShell>
  );
}
