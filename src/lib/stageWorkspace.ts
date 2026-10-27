/** @file Manual stage workbooks and advisory readiness, without automatic approvals. */
export const STAGE_WORKBOOKS: Record<string, string[]> = {
  briefing: [
    "Objetivo e contexto",
    "Público e necessidades",
    "Requisitos funcionais",
    "Materiais disponíveis",
    "Restrições e dependências",
    "Critérios de sucesso e validação",
  ],
  competitor_analysis: [
    "Concorrentes e fontes consultadas",
    "Pontos fortes e limitações",
    "Oportunidades de diferenciação",
    "Recomendações e evidências",
  ],
  kpis: [
    "Indicador e objetivo",
    "Métrica e fonte de dados",
    "Linha de base",
    "Meta a validar",
    "Frequência e responsável",
  ],
  user_journey: [
    "Perfil do usuário",
    "Etapas da jornada",
    "Intenções e pontos de contato",
    "Dificuldades e oportunidades",
    "Critérios de validação",
  ],
  scope_macro: [
    "Objetivo do produto",
    "Módulos e funcionalidades",
    "Prioridades",
    "Integrações",
    "Fora do escopo",
    "Dependências e aceite",
  ],
  roadmap: [
    "Fases e objetivos",
    "Entregáveis por fase",
    "Dependências",
    "Marcos de revisão",
    "Riscos e decisões pendentes",
  ],
  technical_scope: [
    "Arquitetura e ambientes",
    "Tecnologias",
    "Funcionalidades e integrações",
    "Segurança e permissões",
    "Desempenho e acessibilidade",
    "Critérios de aceite",
  ],
  timeline: [
    "Fases e entregas",
    "Duração a validar",
    "Dependências do cliente",
    "Marcos de aprovação",
    "Responsáveis e riscos",
  ],
  investment: [
    "Escopo contemplado",
    "Investimento a revisar",
    "Condições de pagamento",
    "Serviços opcionais e recorrência",
    "Terceiros e exclusões",
    "Validade e aprovação",
  ],
  wireframes: [
    "Telas e objetivos",
    "Hierarquia de conteúdo",
    "Fluxos e estados vazios",
    "Mobile e acessibilidade",
    "Revisões e aceite",
  ],
  prototype: [
    "Fluxos a prototipar",
    "Ferramenta e link de acesso",
    "Cenários de navegação",
    "Plano de validação",
    "Resultados e pendências",
  ],
  design_system: [
    "Identidade e referências",
    "Cores e contraste",
    "Tipografia e espaçamento",
    "Componentes e estados",
    "Responsividade e movimento",
    "Critérios de consistência",
  ],
  setup: [
    "Repositório e responsáveis",
    "Ambientes e variáveis (sem valores secretos)",
    "Execução local e dependências",
    "Branches e revisão",
    "Permissões e segurança",
    "Checklist de configuração",
  ],
  sprints: [
    "Objetivo da sprint",
    "Backlog priorizado",
    "Responsáveis e estimativas",
    "Dependências e riscos",
    "Definição de pronto",
    "Evidências e retrospectiva",
  ],
  qa: [
    "Escopo e ambientes de teste",
    "Cenários críticos",
    "Autenticação e permissões",
    "Mobile e acessibilidade",
    "Defeitos e severidade",
    "Critérios de aceite e evidências",
  ],
  deploy: [
    "Versão e responsáveis",
    "Pré-requisitos de publicação",
    "Backup e plano de rollback",
    "Sequência de deploy",
    "Smoke tests",
    "Critérios de interrupção",
  ],
  monitoring: [
    "Serviços e responsáveis",
    "Métricas e fontes",
    "Alertas e escalonamento",
    "Disponibilidade e desempenho",
    "Procedimento de incidentes",
    "Revisão periódica",
  ],
  training: [
    "Público e objetivos",
    "Roteiro por módulo",
    "Materiais e acessos seguros",
    "Exercícios práticos",
    "Dúvidas e pendências",
    "Confirmação de entrega",
  ],
  evolution_plan: [
    "Resultados observados",
    "Oportunidades priorizadas",
    "Hipóteses e validação",
    "Esforço e dependências",
    "Investimentos a estimar",
    "Plano de acompanhamento",
  ],
};
export function stageDocumentTemplate(
  type: string,
  title: string,
  project: { title?: string; description?: string | null },
  client?: { name?: string; company?: string | null } | null,
) {
  const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
  return (
    `# ${oneLine(title)}\n\nProjeto: ${oneLine(project.title || "A definir")}\nCliente: ${oneLine(client?.company || client?.name || "A vincular")}\n\n> Documento de trabalho. Preencher e revisar antes de considerar aprovado.\n\n${type === "briefing" && project.description ? `## Contexto informado\n${project.description}\n\n` : ""}` +
    (
      STAGE_WORKBOOKS[type] || [
        "Objetivo",
        "Conteúdo e evidências",
        "Decisões e próximos passos",
      ]
    )
      .map((heading) => `## ${heading}\n[A preencher]`)
      .join("\n\n")
  );
}
export function stageReadiness(
  catalog: { type: string; title: string }[],
  docs: { type: string; content?: string | null }[],
  checklist: { is_done?: boolean }[],
) {
  const present = catalog.filter((entry) =>
    docs.some(
      (doc) =>
        doc.type === entry.type &&
        doc.content?.trim() &&
        !doc.content.includes("[A preencher]"),
    ),
  );
  return {
    documents: present.length,
    expected: catalog.length,
    missing: catalog
      .filter((entry) => !present.includes(entry))
      .map((entry) => entry.title),
    done: checklist.filter((item) => item.is_done).length,
    total: checklist.length,
  };
}
export function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function validateStageDates(start: string, due: string) {
  if (
    [start, due].some(
      (value) => value && !Number.isFinite(new Date(value).getTime()),
    )
  )
    throw new Error("Confira as datas informadas.");
  if (start && due && new Date(due) < new Date(start))
    throw new Error("O prazo não pode ser anterior ao início.");
  return {
    started_at: start ? new Date(start).toISOString() : null,
    due_at: due ? new Date(due).toISOString() : null,
  };
}
