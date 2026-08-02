/**
 * 🚀 ProjectIntegrationsBlock.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/integrations/ProjectIntegrationsBlock.tsx
 * @module SevenOS/Integrations
 * @layer Presentation / UI
 * @status Active
 *
 * @description
 * Integrações vinculadas ao projeto e seus estados de conexão.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `ProjectIntegrationsBlock`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `projects`
 * ✅ Aciona Edge Functions: `github-info`, `vercel-info`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useQueryClient, useMutation, useQuery
 *    ↓
 * ProjectIntegrationsBlock.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Query — consulta, cache e invalidação
 * ✅ date-fns — formatação de datas
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/components/admin/integrations/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, ExternalLink, RefreshCw, GitPullRequest, GitCommit, Figma, Rocket, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Props {
  projectId: string;
  initial: { github_repo?: string | null; vercel_project_id?: string | null; figma_url?: string | null };
}

const stateColor: Record<string, string> = {
  READY: "bg-green-500/15 text-green-300 border-green-500/30",
  BUILDING: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  ERROR: "bg-red-500/15 text-red-300 border-red-500/30",
  QUEUED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  CANCELED: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Integrações externas vinculadas ao projeto, com status de conexão.
 */
export default function ProjectIntegrationsBlock({ projectId, initial }: Props) {
  const qc = useQueryClient();
  const [githubRepo, setGithubRepo] = useState(initial.github_repo ?? "");
  const [vercelId, setVercelId] = useState(initial.vercel_project_id ?? "");
  const [figmaUrl, setFigmaUrl] = useState(initial.figma_url ?? "");

  useEffect(() => {
    setGithubRepo(initial.github_repo ?? "");
    setVercelId(initial.vercel_project_id ?? "");
    setFigmaUrl(initial.figma_url ?? "");
  }, [initial.github_repo, initial.vercel_project_id, initial.figma_url]);

  const save = useMutation({
    mutationFn: async () => {
      const normalizedRepo = githubRepo
        .trim()
        .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
        .replace(/\.git$/i, "")
        .replace(/\/+$/, "");
      const { error } = await supabase
        .from("projects")
        .update({
          github_repo: normalizedRepo || null,
          vercel_project_id: vercelId.trim() || null,
          figma_url: figmaUrl.trim() || null,
        } as any)
        .eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Integrações salvas" });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["github-info", projectId] });
      qc.invalidateQueries({ queryKey: ["vercel-info", projectId] });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const gh = useQuery({
    queryKey: ["github-info", projectId, initial.github_repo],
    enabled: !!initial.github_repo,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("github-info", { body: { repo: initial.github_repo } });
      if (error) throw error;
      return data as any;
    },
    staleTime: 60_000,
  });

  const vc = useQuery({
    queryKey: ["vercel-info", projectId, initial.vercel_project_id],
    enabled: !!initial.vercel_project_id,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("vercel-info", { body: { project_id: initial.vercel_project_id } });
      if (error) throw error;
      return data as any;
    },
    staleTime: 60_000,
  });

  return (
    <GlassCard className="p-5 space-y-4 min-w-0">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Integrações</h2>
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="w-4 h-4 mr-1" /> Salvar
        </Button>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1"><Github className="w-3 h-3" /> GitHub (owner/repo)</label>
          <Input value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} placeholder="seven-devx/site" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1"><Rocket className="w-3 h-3" /> Vercel project ID/name</label>
          <Input value={vercelId} onChange={(e) => setVercelId(e.target.value)} placeholder="prj_xxx ou nome" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1"><Figma className="w-3 h-3" /> Figma URL</label>
          <Input value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="https://figma.com/..." />
        </div>
      </div>

      {/* GitHub panel */}
      {initial.github_repo && (
        <div className="rounded-lg border border-border/50 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <a href={gh.data?.repo?.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium hover:underline">
              <Github className="w-4 h-4" /> {gh.data?.repo?.full_name ?? initial.github_repo}
              {gh.data?.repo?.private && <Badge variant="outline" className="text-[10px]">private</Badge>}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <Button size="icon" variant="ghost" onClick={() => gh.refetch()} disabled={gh.isFetching}>
              <RefreshCw className={`w-4 h-4 ${gh.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {gh.error && <p className="text-xs text-red-400">{(gh.error as any).message}</p>}
          {gh.data && (
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1"><GitCommit className="w-3 h-3" /> Últimos commits</p>
                <ul className="space-y-1">
                  {gh.data.commits?.map((c: any) => (
                    <li key={c.sha} className="truncate">
                      <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline">
                        <span className="font-mono text-[10px] text-primary">{c.sha}</span> {c.message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1"><GitPullRequest className="w-3 h-3" /> PRs abertos ({gh.data.pulls?.length ?? 0})</p>
                <ul className="space-y-1">
                  {gh.data.pulls?.length ? gh.data.pulls.map((p: any) => (
                    <li key={p.number}>
                      <a href={p.url} target="_blank" rel="noreferrer" className="hover:underline">#{p.number} {p.title}</a>
                    </li>
                  )) : <li className="text-muted-foreground">Nenhum.</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vercel panel */}
      {initial.vercel_project_id && (
        <div className="rounded-lg border border-border/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium"><Rocket className="w-4 h-4" /> Vercel — {vc.data?.project?.name ?? initial.vercel_project_id}</span>
            <Button size="icon" variant="ghost" onClick={() => vc.refetch()} disabled={vc.isFetching}>
              <RefreshCw className={`w-4 h-4 ${vc.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {vc.error && <p className="text-xs text-red-400">{(vc.error as any).message}</p>}
          <ul className="space-y-1 text-xs">
            {vc.data?.deployments?.map((d: any) => (
              <li key={d.uid} className="flex items-center justify-between gap-2">
                <a href={d.url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                  {d.meta?.branch ?? d.target ?? "preview"} — {d.meta?.msg ?? d.url}
                </a>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(d.created), { addSuffix: true, locale: ptBR })}
                  </span>
                  <Badge variant="outline" className={stateColor[d.state] ?? ""}>{d.state}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Figma quick link */}
      {initial.figma_url && (
        <a href={initial.figma_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline">
          <Figma className="w-4 h-4" /> Abrir design no Figma <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}
    </GlassCard>
  );
}
