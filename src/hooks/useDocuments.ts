/**
 * 📄 useDocuments — Document Engine (stage_documents)
 * Briefings, escopos, propostas, roadmaps gerados por IA ou manualmente.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type DocumentType =
  | "briefing" | "competitor_analysis" | "kpis"
  | "user_journey" | "scope_macro" | "roadmap"
  | "technical_scope" | "timeline" | "investment"
  | "wireframes" | "prototype" | "design_system"
  | "setup" | "sprints" | "qa"
  | "deploy" | "monitoring" | "training" | "evolution_plan"
  | "custom";

/* Catálogo de documentos por slug de etapa do template default */
export const STAGE_DOC_CATALOG: Record<string, { type: DocumentType; title: string; prompt: string }[]> = {
  discovery: [
    { type: "briefing", title: "Briefing", prompt: "Crie um briefing completo e profissional do projeto, com objetivos, público-alvo, dores, requisitos funcionais, restrições e critérios de sucesso." },
    { type: "competitor_analysis", title: "Análise de concorrência", prompt: "Faça uma análise de concorrência: principais players do segmento, pontos fortes/fracos, oportunidades de diferenciação." },
    { type: "kpis", title: "KPIs", prompt: "Defina os KPIs (indicadores de sucesso) deste projeto, separados por aquisição, ativação, retenção, receita e indicação." },
  ],
  strategy: [
    { type: "user_journey", title: "Jornada do usuário", prompt: "Mapeie a jornada do usuário (steps, intenções, dores, oportunidades) em formato detalhado." },
    { type: "scope_macro", title: "Escopo macro", prompt: "Defina o escopo macro do projeto: módulos, features e integrações principais." },
    { type: "roadmap", title: "Roadmap", prompt: "Construa um roadmap em fases (curto, médio e longo prazo) com entregas e marcos." },
  ],
  proposal: [
    { type: "technical_scope", title: "Escopo técnico", prompt: "Detalhe o escopo técnico: arquitetura, stack, integrações, segurança, performance." },
    { type: "timeline", title: "Cronograma", prompt: "Construa um cronograma detalhado por fase, com entregas, prazos estimados e dependências." },
    { type: "investment", title: "Investimento", prompt: "Monte uma proposta de investimento profissional, com valores, formas de pagamento e o que está incluso." },
  ],
  design: [
    { type: "wireframes", title: "Wireframes (descrição)", prompt: "Descreva os wireframes principais (telas-chave) com hierarquia, blocos e fluxo." },
    { type: "prototype", title: "Plano de protótipo", prompt: "Defina o plano de prototipação: telas a prototipar, ferramenta, validação." },
    { type: "design_system", title: "Design System", prompt: "Defina o design system: tokens (cores, tipografia, spacing), componentes base, padrões de motion." },
  ],
  development: [
    { type: "setup", title: "Setup técnico", prompt: "Documente o setup do projeto: stack, repositório, branches, padrão de commits, ambientes." },
    { type: "sprints", title: "Sprints", prompt: "Planeje as sprints com objetivo, backlog, entregas e definição de pronto." },
    { type: "qa", title: "Plano de QA", prompt: "Construa um plano de QA: tipos de teste, ferramentas, critérios de aceite, checklist de release." },
  ],
  launch: [
    { type: "deploy", title: "Plano de deploy", prompt: "Detalhe o plano de deploy: ambientes, pipeline CI/CD, rollback, smoke tests." },
    { type: "monitoring", title: "Monitoramento", prompt: "Defina o plano de monitoramento: ferramentas, métricas, alertas e SLOs." },
    { type: "training", title: "Treinamento", prompt: "Estruture um treinamento para o cliente: módulos, materiais, formato e duração." },
    { type: "evolution_plan", title: "Plano de evolução", prompt: "Construa um plano de evolução pós-lançamento (90 dias) com melhorias e otimizações." },
  ],
};

export const useStageDocuments = (stageId?: string) => {
  return useQuery({
    queryKey: ["stage_documents", stageId],
    enabled: !!stageId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_documents")
        .select("*")
        .eq("stage_id", stageId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useProjectDocuments = (projectId?: string) =>
  useQuery({
    queryKey: ["project_documents", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_documents")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useUpsertDocument = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase
          .from("stage_documents")
          .update({ ...rest, version: (rest.version || 1) + 1 })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("stage_documents").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["stage_documents", data.stage_id] });
      qc.invalidateQueries({ queryKey: ["project_documents", data.project_id] });
      toast({ title: "Documento salvo" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id }: { id: string; stageId?: string; projectId?: string }) => {
      const { error } = await supabase.from("stage_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["stage_documents", vars.stageId] });
      qc.invalidateQueries({ queryKey: ["project_documents", vars.projectId] });
      toast({ title: "Documento excluído" });
    },
  });
};
