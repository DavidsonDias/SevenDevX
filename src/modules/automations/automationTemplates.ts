/**
 * 🚀 automationTemplates.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/modules/automations/automationTemplates.ts
 * @module Automations
 * @layer Feature Module
 * @status Active
 *
 * @description
 * Modelos prontos de automação.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `AutomationTemplate`, `AUTOMATION_TEMPLATES`
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
 * @see src/modules/automations/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * 📚 Templates prontos de automação — 1 clique para criar.
 */
export type AutomationTemplate = {
  id: string;
  name: string;
  description: string;
  trigger_event: string;
  conditions: any[];
  actions: any[];
  emoji: string;
};

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: "slack-new-lead", emoji: "💬",
    name: "Notificar Slack ao receber lead",
    description: "Envia mensagem no Slack toda vez que um novo contato chega.",
    trigger_event: "lead.created",
    conditions: [],
    actions: [{ type: "slack.notify", params: { webhook: "https://hooks.slack.com/...", channel: "#leads", text: "🆕 Lead: {{name}} · {{email}}" } }],
  },
  {
    id: "discord-new-lead", emoji: "🎮",
    name: "Notificar Discord ao receber lead",
    description: "Webhook no canal Discord da equipe comercial.",
    trigger_event: "lead.created",
    conditions: [],
    actions: [{ type: "discord.notify", params: { webhook: "https://discord.com/api/webhooks/...", text: "🆕 Novo lead: **{{name}}** ({{email}})" } }],
  },
  {
    id: "webhook-pipeline", emoji: "🔗",
    name: "Webhook ao mudar pipeline",
    description: "Dispara webhook externo quando um projeto avança de estágio.",
    trigger_event: "project.pipeline_changed",
    conditions: [],
    actions: [{ type: "webhook.call", params: { url: "https://example.com/webhook", method: "POST" } }],
  },
  {
    id: "push-deploy-failed", emoji: "🚨",
    name: "Push ao falhar deploy",
    description: "Notificação push no celular dos admins.",
    trigger_event: "deployment.failed",
    conditions: [],
    actions: [{ type: "push.send", params: { title: "🚨 Deploy falhou", body: "{{project}} – verifique os logs", url: "/admin/system-health" } }],
  },
  {
    id: "ai-lead-summary", emoji: "🤖",
    name: "IA: resumir contexto do lead",
    description: "Gera resumo automático do lead com Gemini Flash.",
    trigger_event: "lead.created",
    conditions: [],
    actions: [{ type: "ai.summarize", params: { prompt: "Resuma este lead em 3 bullets e sugira próxima ação:", model: "google/gemini-2.5-flash" } }],
  },
  {
    id: "ai-lead-scoring", emoji: "🎯",
    name: "Lead scoring com IA",
    description: "Avalia qualidade do lead (0-100) baseado em mensagem/empresa.",
    trigger_event: "lead.created",
    conditions: [{ field: "email", op: "exists", value: "" }],
    actions: [
      { type: "ai.summarize", params: { prompt: "Score (0-100) este lead considerando empresa, mensagem e contexto. Responda apenas JSON {score, reason}:", model: "google/gemini-2.5-flash" } },
    ],
  },
  {
    id: "delay-followup", emoji: "⏱️",
    name: "Follow-up agendado",
    description: "Aguarda 24h e envia notificação para fazer follow-up.",
    trigger_event: "lead.created",
    conditions: [],
    actions: [
      { type: "delay", params: { seconds: 86400 } },
      { type: "push.send", params: { title: "⏰ Hora do follow-up", body: "Lead {{name}} aguarda contato há 24h", url: "/admin?contact={{contact_id}}" } },
    ],
  },
  {
    id: "auto-pipeline-move", emoji: "🔄",
    name: "Mover lead qualificado para Diagnóstico",
    description: "Quando email corporativo, avança automaticamente.",
    trigger_event: "project.pipeline_changed",
    conditions: [{ field: "to", op: "equals", value: "lead" }],
    actions: [{ type: "pipeline.move", params: { stage: "diagnostico" } }],
  },
];
