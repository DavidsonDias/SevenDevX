/**
 * AutomationGuideDrawer.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/automations/AutomationGuideDrawer.tsx
 * @module Automations
 *
 * @description
 * Guia contextual de automações.
 *
 * @see src/modules/automations/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📘 AutomationGuideDrawer — Guia completo enterprise de Automações (WHEN → IF → THEN) no SevenOS.
 * Frontend-only: conceitos, triggers, conditions, actions, templates prontos, troubleshooting, FAQs.
 */
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, BookOpen, Filter, Send, AlertTriangle, HelpCircle, ChevronRight,
  GitBranch, Sparkles, Copy, Check, PlayCircle, Clock, Webhook as WebhookIcon, Mail, MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/useScrollLock";

type Section =
  | "intro" | "anatomia" | "triggers" | "conditions" | "actions"
  | "templates" | "criar" | "troubleshooting" | "faq";

const SECTIONS: { id: Section; label: string; icon: any }[] = [
  { id: "intro",         label: "Visão geral",       icon: BookOpen },
  { id: "anatomia",      label: "Anatomia de um fluxo", icon: GitBranch },
  { id: "triggers",      label: "Triggers (WHEN)",   icon: PlayCircle },
  { id: "conditions",    label: "Conditions (IF)",   icon: Filter },
  { id: "actions",       label: "Actions (THEN)",    icon: Send },
  { id: "templates",     label: "Templates prontos", icon: Sparkles },
  { id: "criar",         label: "Criar do zero",     icon: Zap },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertTriangle },
  { id: "faq",           label: "FAQ",               icon: HelpCircle },
];

const TRIGGERS = [
  { id: "lead.created",       label: "Novo lead",            sample: "Disparado quando lead chega via site ou painel." },
  { id: "lead.updated",       label: "Lead atualizado",      sample: "Status, owner, tags mudaram." },
  { id: "project.created",    label: "Projeto criado",       sample: "Novo projeto no pipeline." },
  { id: "project.pipeline_changed", label: "Mudou de etapa", sample: "Projeto andou no kanban." },
  { id: "contract.signed",    label: "Contrato assinado",    sample: "Cliente assinou contrato." },
  { id: "payment.received",   label: "Pagamento recebido",   sample: "Transação confirmada." },
  { id: "message.received",   label: "Mensagem recebida",    sample: "WhatsApp/Contact Center." },
  { id: "deployment.failed",  label: "Deploy falhou",        sample: "Vercel/Netlify erro." },
  { id: "schedule.cron",      label: "Agendado (cron)",      sample: "Roda em horário fixo (ex: todo dia 9h)." },
  { id: "webhook.received",   label: "Webhook recebido",     sample: "Trigger externo HTTP." },
];

const ACTIONS = [
  { icon: WebhookIcon,   label: "Chamar webhook",     sample: "POST para URL externa com payload customizado." },
  { icon: Mail,          label: "Enviar email",       sample: "Via Resend — template + variáveis do payload." },
  { icon: MessageSquare, label: "WhatsApp",           sample: "Mandar template aprovado para o lead." },
  { icon: Send,          label: "Notificar Slack",    sample: "Mensagem em canal Slack via Incoming Webhook." },
  { icon: GitBranch,     label: "Atualizar registro", sample: "Mudar campo de lead/projeto (status, tag, owner)." },
  { icon: Clock,         label: "Aguardar (delay)",   sample: "Pausa o fluxo por N minutos/horas antes do próximo step." },
  { icon: Sparkles,      label: "IA (7AI)",           sample: "Classificar, resumir ou gerar resposta com Lovable AI." },
];

function CodeBlock({ children, lang = "json" }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children); setCopied(true); toast.success("Copiado");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative rounded-lg border border-white/10 bg-black/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">{lang}</span>
        <button onClick={copy} className="text-white/40 hover:text-white">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11.5px] leading-relaxed text-white/85 font-mono">{children}</pre>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, kicker }: { icon: any; title: string; kicker?: string }) {
  return (
    <div className="mb-4">
      {kicker && <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">{kicker}</div>}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white/80" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
    </div>
  );
}

const TEMPLATES = [
  {
    title: "Novo lead → Notifica Slack + cria projeto",
    desc: "Sempre que um lead chegar, manda alerta no Slack e abre um projeto rascunho.",
    json: {
      trigger: { event: "lead.created" },
      conditions: [{ field: "source", op: "equals", value: "site" }],
      actions: [
        { type: "slack", channel: "#vendas", text: "🔥 Lead novo: {{name}} ({{whatsapp}})" },
        { type: "create_record", entity: "project", data: { name: "Proposta para {{name}}", stage: "discovery" } },
      ],
    },
  },
  {
    title: "Pagamento recebido → Email + WhatsApp + atualiza projeto",
    desc: "Dispara confirmação e move o projeto para 'kick-off'.",
    json: {
      trigger: { event: "payment.received" },
      actions: [
        { type: "email", to: "{{client.email}}", template: "payment_received" },
        { type: "whatsapp", to: "{{client.phone}}", template: "kickoff_scheduling" },
        { type: "update_record", entity: "project", id: "{{project_id}}", set: { stage: "kickoff" } },
      ],
    },
  },
  {
    title: "Deploy falhou → Notifica + cria incidente",
    desc: "Quando Vercel reporta deploy failed, abre incidente automaticamente.",
    json: {
      trigger: { event: "deployment.failed" },
      actions: [
        { type: "slack", channel: "#incidents", text: "🚨 Deploy {{commit}} falhou em {{project}}" },
        { type: "create_record", entity: "incident", data: { severity: "high", title: "Deploy {{commit}} falhou" } },
      ],
    },
  },
  {
    title: "Cron diário 9h → Resumo de leads para o time",
    desc: "Compila leads das últimas 24h com IA e manda no Slack.",
    json: {
      trigger: { schedule: "0 9 * * *", tz: "America/Sao_Paulo" },
      actions: [
        { type: "ai", model: "google/gemini-2.5-flash", prompt: "Resuma estes leads em bullets:" },
        { type: "slack", channel: "#vendas", text: "{{ai_output}}" },
      ],
    },
  },
];

/**
 * Drawer com o guia de uso das automações e exemplos de gatilhos e ações.
 */
export default function AutomationGuideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useScrollLock(open);
  const [active, setActive] = useState<Section>("intro");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-stretch justify-end"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-4xl h-full bg-[#070707] border-l border-white/10 flex flex-col"
          >
            <header className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/[0.04] to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl border border-amber-400/30 bg-amber-400/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Documentação enterprise</div>
                  <h2 className="text-lg font-bold truncate">Automações — Guia completo</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
            </header>

            <div className="flex-1 grid sm:grid-cols-[220px_1fr] overflow-hidden">
              <nav className="border-r border-white/10 p-3 overflow-y-auto bg-white/[0.015] hidden sm:block">
                {SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors mb-0.5 ${
                      active === s.id ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}>
                    <s.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.label}</span>
                    {active === s.id && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </button>
                ))}
              </nav>
              <div className="sm:hidden border-b border-white/10 p-2 overflow-x-auto flex gap-1">
                {SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs ${active === s.id ? "bg-amber-300 text-black" : "bg-white/5 text-white/60"}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto p-6 space-y-6">
                {active === "intro" && (
                  <section>
                    <SectionTitle icon={BookOpen} title="O que são Automações" kicker="01 · Visão geral" />
                    <p className="text-sm text-white/70 leading-relaxed">
                      Automações reagem a eventos do SevenOS (lead, pagamento, deploy, etc) e executam <b>ações encadeadas</b>:
                      enviar email, postar no Slack, criar projeto, chamar webhook, rodar IA. Pense em <b>Zapier interno</b>,
                      mas operando sobre o seu próprio dado, sem APIs intermediárias.
                    </p>
                    <div className="mt-5 p-4 rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 mb-2">A fórmula</div>
                      <div className="flex items-center justify-around text-center gap-2">
                        {[
                          { t: "WHEN", d: "evento dispara", c: "text-amber-300" },
                          { t: "IF",   d: "filtros passam", c: "text-sky-300" },
                          { t: "THEN", d: "ações rodam",   c: "text-emerald-300" },
                        ].map((b, i) => (
                          <div key={b.t} className="flex items-center flex-1 gap-2">
                            <div className="flex-1 text-center">
                              <div className={`text-xl font-bold ${b.c}`}>{b.t}</div>
                              <div className="text-[11px] text-white/50 mt-1">{b.d}</div>
                            </div>
                            {i < 2 && <ChevronRight className="w-5 h-5 text-white/30 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {active === "anatomia" && (
                  <section>
                    <SectionTitle icon={GitBranch} title="Anatomia de um fluxo" kicker="02 · Estrutura" />
                    <p className="text-sm text-white/70 mb-3">Todo fluxo no banco tem este shape:</p>
                    <CodeBlock lang="json">{`{
  "name": "Novo lead vai pro Slack",
  "trigger_event": "lead.created",
  "conditions": [
    { "field": "source", "op": "equals", "value": "site" }
  ],
  "actions": [
    { "type": "slack", "channel": "#vendas", "text": "Lead: {{name}}" },
    { "type": "delay", "minutes": 30 },
    { "type": "email", "to": "{{email}}", "template": "welcome" }
  ],
  "is_active": true
}`}</CodeBlock>
                    <div className="mt-4 p-3 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white/60">
                      <b className="text-white">Templating:</b> use <code>{`{{campo}}`}</code> para puxar dados do payload do trigger.
                      Suporta dot-notation: <code>{`{{client.name}}`}</code>, <code>{`{{project.id}}`}</code>.
                    </div>
                  </section>
                )}

                {active === "triggers" && (
                  <section>
                    <SectionTitle icon={PlayCircle} title="Triggers disponíveis (WHEN)" kicker="03 · O que dispara" />
                    <div className="grid sm:grid-cols-2 gap-2">
                      {TRIGGERS.map((t) => (
                        <div key={t.id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                          <code className="text-xs font-mono text-amber-300">{t.id}</code>
                          <div className="text-sm font-semibold text-white mt-1">{t.label}</div>
                          <div className="text-[11px] text-white/50 mt-0.5">{t.sample}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {active === "conditions" && (
                  <section>
                    <SectionTitle icon={Filter} title="Conditions (IF) — filtros opcionais" kicker="04 · Refinamento" />
                    <p className="text-sm text-white/70 mb-3">
                      Use conditions para rodar a automação apenas quando os campos do payload baterem. Suportadas:
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2 mb-4">
                      {["equals", "not_equals", "contains", "not_contains", "greater_than", "less_than", "in", "not_in", "is_empty", "is_not_empty", "regex_match", "exists"].map((op) => (
                        <code key={op} className="text-[11px] px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 font-mono text-center">{op}</code>
                      ))}
                    </div>
                    <CodeBlock lang="json">{`"conditions": [
  { "field": "data.source",        "op": "in",          "value": ["site","whatsapp"] },
  { "field": "data.amount",        "op": "greater_than","value": 1000 },
  { "field": "data.tags",          "op": "contains",    "value": "vip" },
  { "field": "data.client.email",  "op": "exists" }
]`}</CodeBlock>
                    <div className="mt-3 text-xs text-white/50">Múltiplas conditions são unidas com <b>AND</b>. Para <b>OR</b>, crie automações separadas.</div>
                  </section>
                )}

                {active === "actions" && (
                  <section>
                    <SectionTitle icon={Send} title="Actions (THEN) — o que rodar" kicker="05 · Ações disponíveis" />
                    <div className="grid sm:grid-cols-2 gap-2">
                      {ACTIONS.map((a) => (
                        <div key={a.label} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex gap-3">
                          <div className="w-9 h-9 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center shrink-0">
                            <a.icon className="w-4 h-4 text-white/80" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold">{a.label}</div>
                            <div className="text-[11px] text-white/55 mt-0.5">{a.sample}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {active === "templates" && (
                  <section>
                    <SectionTitle icon={Sparkles} title="Templates prontos para colar" kicker="06 · Quick-start" />
                    <div className="space-y-4">
                      {TEMPLATES.map((tpl) => (
                        <div key={tpl.title} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                          <div className="text-sm font-semibold mb-1">{tpl.title}</div>
                          <div className="text-xs text-white/55 mb-3">{tpl.desc}</div>
                          <CodeBlock lang="json">{JSON.stringify(tpl.json, null, 2)}</CodeBlock>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {active === "criar" && (
                  <section>
                    <SectionTitle icon={Zap} title="Criar do zero — passo a passo" kicker="07 · Hands-on" />
                    <ol className="space-y-3">
                      {[
                        { t: "Clique em \"Novo fluxo\"", d: "No topo da página de Automações abre o builder visual node-based." },
                        { t: "Adicione um node Trigger (WHEN)", d: "Escolha o evento que dispara (ex: lead.created). Só pode existir um por fluxo." },
                        { t: "Adicione Conditions (IF) — opcional", d: "Arraste o node de filtro e configure os critérios. Pular = roda sempre." },
                        { t: "Adicione Actions (THEN)", d: "Arraste quantos nodes de ação quiser. A ordem importa — eles rodam em sequência." },
                        { t: "Conecte os nodes", d: "Puxe a linha do output do trigger para o input do primeiro action. Engate o resto em cadeia." },
                        { t: "Dê nome e salve", d: "Nome curto e descritivo. Salva como inativo por padrão." },
                        { t: "Teste com payload mock", d: "Use o botão \"Testar fluxo\" no builder — dispara com payload simulado sem afetar dados reais." },
                        { t: "Ative o toggle", d: "Quando estiver confiante, ligue o switch verde. A partir daí, eventos reais começam a disparar." },
                      ].map((s, i) => (
                        <li key={i} className="flex gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                          <div className="w-7 h-7 rounded-full bg-amber-300 text-black text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                          <div>
                            <div className="text-sm font-semibold">{s.t}</div>
                            <div className="text-xs text-white/55 mt-1 leading-relaxed">{s.d}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {active === "troubleshooting" && (
                  <section>
                    <SectionTitle icon={AlertTriangle} title="Problemas comuns" kicker="08 · Troubleshooting" />
                    <div className="space-y-2">
                      {[
                        { p: "Automação não dispara", s: "Verifique: 1) toggle ativo, 2) evento marcado correto, 3) conditions não estão bloqueando. Use o histórico de execuções para confirmar se o trigger foi capturado." },
                        { p: "Variáveis vêm vazias ({{name}} aparece literal)", s: "O campo não existe no payload daquele evento. Veja o catálogo de eventos em Webhooks → Estrutura do payload para o shape exato." },
                        { p: "Action de email falha", s: "Resend precisa estar conectado em Integrações e o secret RESEND_API_KEY salvo." },
                        { p: "Action de Slack falha", s: "Use o Slack Incoming Webhook URL completa. Para canais privados, o app precisa estar adicionado ao canal." },
                        { p: "Loop infinito", s: "Cuidado com automações que disparam o próprio trigger (ex: update_record → lead.updated). Use conditions para quebrar." },
                        { p: "Delay não respeita o tempo", s: "Delays curtos (<1min) podem ser comprimidos. Use mínimo 60s para precisão." },
                      ].map((t) => (
                        <div key={t.p} className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                          <div className="text-sm font-semibold text-white">{t.p}</div>
                          <div className="text-xs text-white/55 mt-1">{t.s}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {active === "faq" && (
                  <section>
                    <SectionTitle icon={HelpCircle} title="Perguntas frequentes" kicker="09 · FAQ" />
                    <div className="space-y-2">
                      {[
                        { q: "Qual a diferença entre Automação e Webhook?", a: "Webhook = nós enviamos um POST pra você. Automação = nós rodamos ações internas (e podem inclusive incluir 'chamar webhook' como uma das ações)." },
                        { q: "Posso encadear automações?", a: "Sim. Uma action pode atualizar um registro que dispara outro trigger. Use com cuidado para não criar loops." },
                        { q: "Tem histórico de execuções?", a: "Sim — cada run fica registrado com status, payload de entrada, output de cada action e erros." },
                        { q: "Roda em ordem síncrona?", a: "Sim, actions executam sequencialmente. Use delay node para pausar entre elas." },
                        { q: "Posso usar JS custom?", a: "Ainda não. Para lógica avançada, encadeie ação 'chamar webhook' apontando para sua Edge Function." },
                        { q: "Quantas automações posso ter?", a: "Sem cap. Mas evite duplicação — prefira condicionais a múltiplas automações com mesmo trigger." },
                      ].map((f, i) => (
                        <details key={i} className="group rounded-xl border border-white/10 bg-white/[0.02]">
                          <summary className="flex items-center justify-between cursor-pointer p-3.5 list-none">
                            <span className="text-sm">{f.q}</span>
                            <ChevronRight className="w-4 h-4 text-white/30 group-open:rotate-90 transition-transform" />
                          </summary>
                          <div className="px-3.5 pb-3.5 text-xs text-white/60 leading-relaxed">{f.a}</div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
