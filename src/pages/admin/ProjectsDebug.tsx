/**
 * ProjectsDebug.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/ProjectsDebug.tsx
 * @module SevenOS/Admin
 * @route /admin/projects/debug
 *
 * @description
 * Tela de diagnóstico de dados de projetos.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🛠️ Debug Panel — Projects diagnostic (admin-only)
 * Displays totals, broken/missing data and rendering counts.
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import type { DbProject } from "@/hooks/useProjects";
import AdminPageShell from "@/components/admin/AdminPageShell";

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

const ProjectsDebug = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuthContext();

  if (!authLoading && !isAdmin) {
    navigate("/auth", { replace: true });
  }

  const { data: all, isLoading } = useQuery({
    queryKey: ["projects", "debug-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return data as DbProject[];
    },
    enabled: isAdmin,
  });

  const stats = (() => {
    if (!all) return null;
    const renderedOnSite = all.filter((p) => p.is_published_on_site && p.status === "published");
    const noImage = all.filter((p) => !p.cover_image);
    const noSlug = all.filter((p) => !p.slug);
    const drafts = all.filter((p) => p.status === "draft");
    const archived = all.filter((p) => p.status === "archived");
    const primaries = all.filter((p) => p.featured_level === "primary");
    const secondaries = all.filter((p) => p.featured_level === "secondary");

    // Detect duplicate slugs
    const slugCount: Record<string, number> = {};
    all.forEach((p) => {
      slugCount[p.slug] = (slugCount[p.slug] || 0) + 1;
    });
    const duplicateSlugs = Object.entries(slugCount).filter(([, n]) => n > 1).map(([s]) => s);

    return {
      total: all.length,
      renderedOnSite: renderedOnSite.length,
      noImage,
      noSlug,
      drafts,
      archived,
      primaries,
      secondaries,
      duplicateSlugs,
    };
  })();

  return (
    <>
      <SEOHead title="Debug · Projetos | SevenDevX Admin" description="Diagnóstico do CMS de projetos." />
      <AdminPageShell
        title="Debug · Projetos"
        subtitle="Diagnóstico de consistência e renderização"
        backFallback="/admin/projects"
      >
        {isLoading || !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats grid */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Stat label="Total no banco" value={stats.total} />
              <Stat label="Renderizados no site" value={stats.renderedOnSite} highlight />
              <Stat label="Destaques principais" value={stats.primaries.length} />
              <Stat label="Destaques secundários" value={stats.secondaries.length} />
              <Stat label="Rascunhos" value={stats.drafts.length} />
              <Stat label="Arquivados" value={stats.archived.length} />
              <Stat label="Sem imagem" value={stats.noImage.length} warn={stats.noImage.length > 0} />
              <Stat label="Sem slug" value={stats.noSlug.length} warn={stats.noSlug.length > 0} />
            </section>

            {/* Issues */}
            <section className="space-y-4">
              <IssueGroup
                title="Slugs duplicados"
                items={stats.duplicateSlugs}
                empty="Todos os slugs são únicos."
                render={(s) => <Badge key={s} variant="destructive">/{s}</Badge>}
              />

              <IssueGroup
                title="Projetos sem imagem"
                items={stats.noImage}
                empty="Todos os projetos possuem imagem de capa."
                render={(p) => (
                  <Badge key={p.id} variant="outline" className="text-xs">
                    {p.title}
                  </Badge>
                )}
              />

              <IssueGroup
                title="Projetos sem slug"
                items={stats.noSlug}
                empty="Todos os projetos possuem slug."
                render={(p) => (
                  <Badge key={p.id} variant="outline" className="text-xs">
                    {p.title}
                  </Badge>
                )}
              />

              {stats.primaries.length > 1 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-destructive">
                      Múltiplos destaques principais detectados
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Apenas 1 projeto pode ser "Destaque Principal". O trigger de banco corrigirá automaticamente
                      no próximo update.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {stats.primaries.map((p) => (
                        <Badge key={p.id} variant="destructive">{p.title}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </AdminPageShell>
    </>
  );
};

const Stat = ({ label, value, highlight, warn }: { label: string; value: number; highlight?: boolean; warn?: boolean }) => (
  <div
    className={`rounded-lg border p-4 ${
      warn
        ? "border-destructive/30 bg-destructive/5"
        : highlight
        ? "border-primary/30 bg-primary/5"
        : "border-border bg-card"
    }`}
  >
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${warn ? "text-destructive" : ""}`}>{value}</p>
  </div>
);

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const IssueGroup = <T,>({
  title,
  items,
  empty,
  render,
}: {
  title: string;
  items: T[];
  empty: string;
  render: (item: T) => React.ReactNode;
}) => (
  <div className="rounded-lg border border-border bg-card p-4">
    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
      {items.length === 0 ? (
        <CheckCircle2 className="w-4 h-4 text-primary" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-destructive" />
      )}
      {title} <span className="text-muted-foreground font-normal">({items.length})</span>
    </h3>
    {items.length === 0 ? (
      <p className="text-xs text-muted-foreground">{empty}</p>
    ) : (
      <div className="flex flex-wrap gap-1.5">{items.map(render)}</div>
    )}
  </div>
);

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default ProjectsDebug;
