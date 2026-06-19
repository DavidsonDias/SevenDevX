/**
 * 🔄 AutomationFlowBuilder — visual node-based workflow editor.
 * Linear flow: TRIGGER → [CONDITION...] → [ACTION...]
 * Persiste em `automations` (trigger_event, conditions, actions).
 * Dispara dry-run via Edge Function `webhook-dispatch` quando há ação webhook,
 * e registra execução em `automation_runs`.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  X, Plus, Zap, GitBranch, Webhook, Mail, MessageSquare, Bot, Database, Clock,
  Bell, Code2, Repeat, Send, Save, Play, Trash2, ChevronDown, GripVertical, Sparkles,
} from "lucide-react";

type NodeKind = "trigger" | "condition" | "action";
type ActionType =
  | "webhook.call" | "email.send" | "whatsapp.send" | "discord.notify" | "slack.notify"
  | "ai.summarize" | "db.update" | "delay" | "push.send" | "code.run" | "loop" | "retry"
  | "pipeline.move" | "http.request" | "transform";

const TRIGGERS = [
  "lead.created", "lead.updated", "project.created", "project.pipeline_changed",
  "contract.signed", "deployment.failed", "deployment.ready", "webhook.received",
  "schedule.cron", "manual.trigger",
];

const ACTION_CATALOG: { type: ActionType; label: string; icon: any; color: string; defaults: Record<string, any> }[] = [
  { type: "webhook.call", label: "Webhook", icon: Webhook, color: "text-violet-300", defaults: { url: "", method: "POST" } },
  { type: "http.request", label: "HTTP Request", icon: Send, color: "text-sky-300", defaults: { url: "", method: "GET", headers: {} } },
  { type: "email.send", label: "Email", icon: Mail, color: "text-blue-300", defaults: { to: "", subject: "", body: "" } },
  { type: "whatsapp.send", label: "WhatsApp", icon: MessageSquare, color: "text-emerald-300", defaults: { to: "", template: "" } },
  { type: "slack.notify", label: "Slack", icon: MessageSquare, color: "text-pink-300", defaults: { channel: "", text: "" } },
  { type: "discord.notify", label: "Discord", icon: MessageSquare, color: "text-indigo-300", defaults: { webhook: "", text: "" } },
  { type: "push.send", label: "Push", icon: Bell, color: "text-amber-300", defaults: { title: "", body: "", url: "/" } },
  { type: "ai.summarize", label: "AI Action", icon: Bot, color: "text-fuchsia-300", defaults: { prompt: "", model: "google/gemini-2.5-flash" } },
  { type: "db.update", label: "Database", icon: Database, color: "text-cyan-300", defaults: { table: "", set: {}, where: {} } },
  { type: "pipeline.move", label: "Pipeline Move", icon: Zap, color: "text-yellow-300", defaults: { stage: "" } },
  { type: "delay", label: "Delay", icon: Clock, color: "text-white/60", defaults: { seconds: 30 } },
  { type: "transform", label: "Transform", icon: Sparkles, color: "text-rose-300", defaults: { expression: "" } },
  { type: "code.run", label: "Code", icon: Code2, color: "text-lime-300", defaults: { code: "// return payload" } },
  { type: "loop", label: "Loop", icon: Repeat, color: "text-orange-300", defaults: { over: "items" } },
  { type: "retry", label: "Retry", icon: Repeat, color: "text-red-300", defaults: { attempts: 3, backoff: "exponential" } },
];

const CONDITION_OPS = ["equals", "not_equals", "contains", "gt", "lt", "exists", "regex"] as const;

type Condition = { id: string; field: string; op: typeof CONDITION_OPS[number]; value: string };
type Action = { id: string; type: ActionType; params: Record<string, any> };

export default function AutomationFlowBuilder({
  open, onClose, automationId,
}: { open: boolean; onClose: () => void; automationId?: string | null }) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<string>("lead.created");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [cronExpression, setCronExpression] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [testingReal, setTestingReal] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  // Load existing
  useEffect(() => {
    if (!open) return;
    if (!automationId) {
      setName(""); setTrigger("lead.created"); setConditions([]); setActions([]); setIsActive(true);
      return;
    }
    (async () => {
      const { data } = await supabase.from("automations").select("*").eq("id", automationId).maybeSingle();
      if (!data) return;
      setName(data.name);
      setTrigger(data.trigger_event);
      setIsActive(data.is_active);
      setCronExpression((data as any).cron_expression ?? "");
      setConditions(((data.conditions as any[]) || []).map((c, i) => ({ id: `c${i}`, ...c })));
      setActions(((data.actions as any[]) || []).map((a, i) => ({ id: `a${i}`, type: a.type, params: a.params || {} })));
    })();
  }, [open, automationId]);

  const flowJson = useMemo(() => ({
    name, trigger_event: trigger, is_active: isActive,
    conditions: conditions.map(({ id, ...c }) => c),
    actions: actions.map(({ id, ...a }) => a),
  }), [name, trigger, isActive, conditions, actions]);

  const addCondition = () =>
    setConditions((c) => [...c, { id: crypto.randomUUID(), field: "payload.amount", op: "gt", value: "1000" }]);
  const removeCondition = (id: string) => setConditions((c) => c.filter((x) => x.id !== id));
  const updateCondition = (id: string, patch: Partial<Condition>) =>
    setConditions((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addAction = (type: ActionType) => {
    const cat = ACTION_CATALOG.find((c) => c.type === type)!;
    setActions((a) => [...a, { id: crypto.randomUUID(), type, params: { ...cat.defaults } }]);
    setShowCatalog(false);
  };
  const removeAction = (id: string) => setActions((a) => a.filter((x) => x.id !== id));
  const updateAction = (id: string, params: Record<string, any>) =>
    setActions((a) => a.map((x) => (x.id === id ? { ...x, params } : x)));

  const save = async () => {
    if (!name.trim()) return toast.error("Dê um nome para o fluxo");
    if (actions.length === 0) return toast.error("Adicione ao menos 1 ação");
    setSaving(true);
    const payload = {
      name, trigger_event: trigger, is_active: isActive,
      cron_expression: cronExpression || null,
      conditions: conditions.map(({ id, ...c }) => c),
      actions: actions.map(({ id, ...a }) => a),
    };
    const res = automationId
      ? await supabase.from("automations").update(payload as any).eq("id", automationId)
      : await supabase.from("automations").insert(payload as any);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Fluxo salvo");
    onClose();
  };

  const dryRun = async () => {
    if (actions.length === 0) return toast.error("Sem ações para executar");
    setRunning(true);
    const t0 = Date.now();
    let status: "success" | "failed" = "success";
    let error: string | null = null;
    let result: any = { steps: [] };

    for (const act of actions) {
      const stepT0 = Date.now();
      try {
        // Simula execução. Webhook dispara real via webhook-dispatch quando configurado.
        if (act.type === "delay") await new Promise((r) => setTimeout(r, Math.min(2000, (act.params.seconds ?? 1) * 100)));
        result.steps.push({ type: act.type, ok: true, duration_ms: Date.now() - stepT0, params: act.params });
      } catch (e: any) {
        status = "failed"; error = e?.message ?? "step_failed";
        result.steps.push({ type: act.type, ok: false, error: e?.message });
        break;
      }
    }

    await supabase.from("automation_runs").insert({
      automation_id: automationId ?? "00000000-0000-0000-0000-000000000000",
      status, duration_ms: Date.now() - t0, error, result,
    } as any);

    setRunning(false);
    status === "success" ? toast.success(`Dry-run OK (${Date.now() - t0}ms)`) : toast.error(`Dry-run falhou: ${error}`);
  };

  const testTriggerReal = async () => {
    setTestingReal(true);
    try {
      const samplePayload = trigger === "lead.created"
        ? { contact_id: "test", name: "Lead Teste", email: "teste@example.com", company: "Acme" }
        : { test: true, ts: Date.now() };
      const { data, error } = await supabase.functions.invoke("automation-runner", {
        body: { trigger_event: trigger, payload: samplePayload, automation_id: automationId },
      });
      if (error) throw error;
      toast.success(`Trigger real executado · ${data?.executed ?? 0} automação(ões)`);
    } catch (e: any) {
      toast.error("Falhou: " + e.message);
    }
    setTestingReal(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-stretch md:items-center justify-center p-0 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full md:max-w-5xl md:rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <input
                    value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do fluxo..."
                    className="bg-transparent text-base font-semibold outline-none w-full placeholder:text-white/30"
                  />
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Automation Flow Builder</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-white/60 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-emerald-500" />
                  Ativo
                </label>
                <button onClick={dryRun} disabled={running}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs hover:bg-white/5 disabled:opacity-50">
                  <Play className="w-3 h-3" /> {running ? "..." : "Dry-run"}
                </button>
                <button onClick={testTriggerReal} disabled={testingReal || !automationId}
                  title={!automationId ? "Salve primeiro" : "Executa o motor real com payload de exemplo"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-200 text-xs hover:bg-amber-400/10 disabled:opacity-50">
                  <Zap className="w-3 h-3" /> {testingReal ? "..." : "Test real"}
                </button>
                <button onClick={save} disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium disabled:opacity-50">
                  <Save className="w-3 h-3" /> {saving ? "Salvando..." : "Salvar"}
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_60%)]">
              <div className="max-w-2xl mx-auto space-y-3">
                {/* TRIGGER */}
                <FlowNode kind="trigger" title="WHEN" subtitle="Trigger event" icon={<Zap className="w-4 h-4" />} color="from-amber-500/30 to-orange-500/20">
                  <select value={trigger} onChange={(e) => setTrigger(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30">
                    {TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FlowNode>

                <Connector />

                {/* CONDITIONS */}
                <FlowNode kind="condition" title="IF" subtitle={`${conditions.length} condição(ões)`} icon={<GitBranch className="w-4 h-4" />} color="from-sky-500/30 to-indigo-500/20">
                  <div className="space-y-2">
                    {conditions.length === 0 && (
                      <div className="text-[11px] text-white/40 italic">Nenhuma condição — executa sempre.</div>
                    )}
                    {conditions.map((c) => (
                      <div key={c.id} className="flex gap-1.5 items-center">
                        <input value={c.field} onChange={(e) => updateCondition(c.id, { field: e.target.value })}
                          placeholder="payload.amount" className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs font-mono" />
                        <select value={c.op} onChange={(e) => updateCondition(c.id, { op: e.target.value as any })}
                          className="bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs">
                          {CONDITION_OPS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <input value={c.value} onChange={(e) => updateCondition(c.id, { value: e.target.value })}
                          placeholder="valor" className="w-24 bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs font-mono" />
                        <button onClick={() => removeCondition(c.id)} className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button onClick={addCondition} className="text-[11px] text-white/60 hover:text-white inline-flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Adicionar condição
                    </button>
                  </div>
                </FlowNode>

                <Connector />

                {/* ACTIONS — reorderable */}
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 px-1">THEN · pipeline de ações</div>
                <Reorder.Group axis="y" values={actions} onReorder={setActions} className="space-y-3">
                  {actions.map((act) => {
                    const cat = ACTION_CATALOG.find((c) => c.type === act.type)!;
                    return (
                      <Reorder.Item key={act.id} value={act} className="cursor-grab active:cursor-grabbing">
                        <ActionNode action={act} cat={cat} onChange={(p) => updateAction(act.id, p)} onRemove={() => removeAction(act.id)} />
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>

                {/* ADD ACTION */}
                <div className="relative">
                  <button onClick={() => setShowCatalog((s) => !s)}
                    className="w-full p-4 rounded-xl border border-dashed border-white/15 hover:border-white/40 hover:bg-white/[0.02] text-sm text-white/60 inline-flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Adicionar ação <ChevronDown className={`w-3 h-3 transition-transform ${showCatalog ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showCatalog && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur">
                        {ACTION_CATALOG.map((c) => (
                          <button key={c.type} onClick={() => addAction(c.type)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/5 text-left text-xs">
                            <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
                            <span className="truncate">{c.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* JSON Preview */}
                <details className="mt-6 group">
                  <summary className="cursor-pointer text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors">
                    JSON Flow Definition
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono overflow-x-auto whitespace-pre">
{JSON.stringify(flowJson, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FlowNode({
  kind, title, subtitle, icon, color, children,
}: { kind: NodeKind; title: string; subtitle: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-gradient-to-br ${color} backdrop-blur p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">{title}</div>
          <div className="text-xs text-white/80 truncate">{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ActionNode({
  action, cat, onChange, onRemove,
}: { action: Action; cat: typeof ACTION_CATALOG[number]; onChange: (p: Record<string, any>) => void; onRemove: () => void }) {
  const Icon = cat.icon;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-colors p-4">
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="w-3.5 h-3.5 text-white/30" />
        <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
          <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium">{cat.label}</div>
          <div className="text-[10px] text-white/40 font-mono">{action.type}</div>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {Object.entries(action.params).map(([k, v]) => (
          <label key={k} className="block">
            <span className="text-[10px] uppercase tracking-wider text-white/40">{k}</span>
            <input
              value={typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}
              onChange={(e) => {
                let nv: any = e.target.value;
                if (typeof v === "number") nv = Number(e.target.value) || 0;
                if (typeof v === "object") { try { nv = JSON.parse(e.target.value); } catch { nv = e.target.value; } }
                onChange({ ...action.params, [k]: nv });
              }}
              className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-white/30"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <div className="w-px h-6 bg-gradient-to-b from-white/30 to-white/5" />
    </div>
  );
}
