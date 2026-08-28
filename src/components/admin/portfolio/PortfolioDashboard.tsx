/**
 * 🚀 PortfolioDashboard.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/portfolio/PortfolioDashboard.tsx
 * @module SevenOS/Admin
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Visão geral do CMS do Portfólio: contadores reais por área, estado de
 * publicação, versão de conteúdo e saúde da API pública.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Nenhum número é estimado — todos vêm do banco ou da API pública
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useQuery } from "@tanstack/react-query";
import {
  Layers, FolderKanban, Briefcase, GraduationCap, Award, Wrench,
  Newspaper, Search, Clock, GitBranch, CheckCircle2, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStackTechs } from "@/hooks/useTechStack";
import { usePortfolioProjects, type PortfolioSettings, PORTFOLIO_API_URL } from "@/hooks/usePortfolio";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Props = { settings: PortfolioSettings | null; onNavigate: (area: string) => void };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/** Dashboard inicial do módulo Portfólio. */
export default function PortfolioDashboard({ settings, onNavigate }: Props) {
  const { data: techs = [] } = useStackTechs();
  const { data: projects = [] } = usePortfolioProjects();

  const { data: blogCount = 0 } = useQuery({
    queryKey: ["portfolio_blog_count"],
    queryFn: async () => {
      const { count } = await sb
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const { data: apiOk } = useQuery({
    queryKey: ["portfolio_api_health"],
    queryFn: async () => {
      try {
        const res = await fetch(PORTFOLIO_API_URL, { method: "GET" });
        return res.ok;
      } catch {
        return false;
      }
    },
    staleTime: 60_000,
  });

  const cv = settings?.cv ?? {};
  const stack = techs.filter((t) => t.show_in_stack && t.is_active).length;
  const published = projects.filter((p) => p.portfolio_enabled && p.status === "published").length;
  const seoOk = Boolean(settings?.seo && Object.keys(settings.seo).length > 0);

  const cards = [
    { key: "stack", icon: Layers, label: "Stack", value: `${stack}`, hint: "tecnologias publicadas" },
    { key: "projects", icon: FolderKanban, label: "Projetos", value: `${published}`, hint: `de ${projects.length} no SevenOS` },
    { key: "career", icon: Briefcase, label: "Experiências", value: `${(cv.experiences ?? []).length}`, hint: "registros" },
    { key: "career", icon: GraduationCap, label: "Formações", value: `${(cv.education ?? []).length}`, hint: "registros" },
    { key: "career", icon: Award, label: "Certificações", value: `${(cv.certifications ?? []).length}`, hint: "registros" },
    { key: "content", icon: Wrench, label: "Serviços", value: `${(settings?.services ?? []).length}`, hint: "no site" },
    { key: "content", icon: Newspaper, label: "Blog", value: `${blogCount}`, hint: "posts publicados" },
    { key: "seo", icon: Search, label: "SEO", value: seoOk ? "OK" : "Pendente", hint: "metadados do site" },
  ];

  const statuses = [
    { ok: apiOk !== false, label: "API pública online" },
    { ok: settings?.is_published !== false, label: "Conteúdo publicado" },
    { ok: stack > 0, label: "Stack sincronizada" },
    { ok: published > 0, label: "Projetos sincronizados" },
    { ok: seoOk, label: "SEO configurado" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.key)}
            className="text-left rounded-xl border border-border bg-foreground/[0.02] p-4 hover:bg-foreground/5 transition-colors focus-visible:ring-1 focus-visible:ring-foreground/40"
          >
            <c.icon className="w-4 h-4 text-muted-foreground" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{c.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="text-[10px] text-muted-foreground">{c.hint}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4 space-y-2">
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Status do Portfólio</h3>
          <ul className="space-y-1.5">
            {statuses.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-sm">
                {s.ok
                  ? <CheckCircle2 className="w-4 h-4 text-muted-foreground" aria-hidden />
                  : <XCircle className="w-4 h-4 text-destructive" aria-hidden />}
                <span className={s.ok ? "" : "text-destructive"}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Publicação</h3>
          <p className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Última atualização:{" "}
            {settings?.updated_at ? new Date(settings.updated_at).toLocaleString("pt-BR") : "—"}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            Versão do conteúdo: <span className="tabular-nums">{settings?.content_version ?? 0}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
