/**
 * 🪝 Webhooks Manager — enterprise CRUD + delivery logs + manual test.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Plus, Webhook as WebhookIcon, Send, Trash2, Power, Copy, CheckCircle2, XCircle, Loader2, Bug, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WebhookPayloadViewer from "@/modules/webhooks/WebhookPayloadViewer";
import WebhookDebugger from "@/modules/webhooks/WebhookDebugger";
import WebhookGuideDrawer from "@/modules/webhooks/WebhookGuideDrawer";

const EVENT_CATALOG = [
  "lead.created", "lead.updated", "project.created", "project.pipeline_changed",
  "contract.signed", "payment.received", "deployment.failed", "deployment.ready",
  "message.received", "user.invited", "user.login",
];

interface Webhook {
  id: string; name: string; url: string | null; secret: string;
  events: string[]; is_active: boolean; success_count: number; failure_count: number;
  last_delivery_at: string | null; description: string | null;
}

export default function WebhooksAdmin() {
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", events: [] as string[] });
  const [testing, setTesting] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [debugging, setDebugging] = useState<Webhook | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("webhooks").select("*").order("created_at", { ascending: false });
    setHooks((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selected) { setDeliveries([]); return; }
    supabase.from("webhook_deliveries").select("*").eq("webhook_id", selected).order("delivered_at", { ascending: false }).limit(50)
      .then(({ data }) => setDeliveries(data || []));
    const ch = supabase
      .channel(`wh-deliv-${selected}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "webhook_deliveries", filter: `webhook_id=eq.${selected}` },
        (p) => setDeliveries((prev) => [p.new as any, ...prev].slice(0, 50)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected]);

  const create = async () => {
    if (!form.name || !form.url) return toast.error("Nome e URL obrigatórios");
    const { error } = await supabase.from("webhooks").insert({
      name: form.name, url: form.url, events: form.events, is_active: true,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Webhook criado");
    setForm({ name: "", url: "", events: [] }); setCreating(false); load();
  };

  const toggle = async (h: Webhook) => {
    await supabase.from("webhooks").update({ is_active: !h.is_active } as any).eq("id", h.id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Remover webhook?")) return;
    await supabase.from("webhooks").delete().eq("id", id);
    load();
  };

  const test = async (h: Webhook) => {
    setTesting(h.id);
    const { data, error } = await supabase.functions.invoke("webhook-dispatch", {
      body: { webhook_id: h.id, event: "test.ping", payload: { hello: "SevenOS", at: new Date().toISOString() } },
    });
    setTesting(null);
    if (error) toast.error(error.message);
    else if ((data as any)?.ok) toast.success(`Entrega OK (${(data as any).status} · ${(data as any).duration_ms}ms)`);
    else toast.warning(`Resposta ${(data as any)?.status || "?"} — ver logs`);
    if (selected === h.id) {
      const { data: d2 } = await supabase.from("webhook_deliveries").select("*").eq("webhook_id", h.id).order("delivered_at", { ascending: false }).limit(50);
      setDeliveries(d2 || []);
    }
  };

  return (
    <AdminPageShell
      title="Webhooks"
      subtitle="Endpoints assinados HMAC · entregas · replay"
      actions={
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90">
          <Plus className="w-4 h-4" /> Novo webhook
        </button>
      }
    >
      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Nome (ex: Slack notif)"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="https://endpoint.exemplo.com/hook"
              value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Eventos</div>
            <div className="flex flex-wrap gap-2">
              {EVENT_CATALOG.map(ev => {
                const on = form.events.includes(ev);
                return (
                  <button key={ev} onClick={() => setForm(f => ({ ...f, events: on ? f.events.filter(x => x !== ev) : [...f.events, ev] }))}
                    className={`px-2.5 py-1 rounded-full text-[11px] border ${on ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:bg-white/5"}`}>
                    {ev}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancelar</button>
            <button onClick={create} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">Criar</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
      ) : hooks.length === 0 ? (
        <div className="text-center py-20 text-white/50 text-sm">Nenhum webhook ainda. Crie o primeiro acima.</div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-3">
            {hooks.map(h => (
              <motion.div key={h.id} layout
                className={`p-4 rounded-xl border ${selected === h.id ? "border-white/40 bg-white/5" : "border-white/10 hover:border-white/20"} transition-colors cursor-pointer`}
                onClick={() => setSelected(h.id)}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <WebhookIcon className="w-4 h-4 text-white/60" />
                      <span className="font-medium">{h.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${h.is_active ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-white/20"}`} />
                    </div>
                    <div className="text-xs text-white/40 truncate mt-0.5 font-mono">{h.url}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); test(h); }} disabled={testing === h.id}
                      className="p-2 rounded-lg border border-white/10 hover:bg-white/5" title="Testar">
                      {testing === h.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDebugging(h); }}
                      className="p-2 rounded-lg border border-white/10 hover:bg-fuchsia-500/10 hover:text-fuchsia-300" title="Debugger">
                      <Bug className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggle(h); }}
                      className="p-2 rounded-lg border border-white/10 hover:bg-white/5" title="Ativar/Desativar">
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(h.secret); toast.success("Secret copiado"); }}
                      className="p-2 rounded-lg border border-white/10 hover:bg-white/5" title="Copiar secret">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); remove(h.id); }}
                      className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:text-red-400" title="Remover">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {h.events.map(e => <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60 font-mono">{e}</span>)}
                </div>
                <div className="flex gap-4 mt-3 text-[11px] text-white/40">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> {h.success_count}</span>
                  <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> {h.failure_count}</span>
                  {h.last_delivery_at && <span>Última: {new Date(h.last_delivery_at).toLocaleString("pt-BR")}</span>}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-white/40 px-1">Entregas {selected ? "" : "(selecione um webhook)"}</div>
            <div className="max-h-[70vh] overflow-y-auto space-y-2">
              {deliveries.map(d => (
                <button key={d.id} onClick={() => setViewing(d)}
                  className="w-full text-left p-3 rounded-lg border border-white/10 bg-white/[0.02] text-xs hover:border-white/30 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono">{d.event}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${d.response_status >= 200 && d.response_status < 300 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {d.response_status || "ERR"}
                    </span>
                  </div>
                  <div className="text-white/40 text-[10px]">{new Date(d.delivered_at).toLocaleString("pt-BR")} · {d.duration_ms}ms</div>
                  {d.error && <div className="text-red-400/80 mt-1 line-clamp-1">{d.error}</div>}
                </button>
              ))}
              {selected && deliveries.length === 0 && <div className="text-white/30 text-sm text-center py-8">Sem entregas ainda.</div>}
            </div>
          </div>
        </div>
      )}
      <WebhookPayloadViewer delivery={viewing} open={!!viewing} onClose={() => setViewing(null)}
        onReplayed={async () => {
          if (!selected) return;
          const { data } = await supabase.from("webhook_deliveries").select("*").eq("webhook_id", selected).order("delivered_at", { ascending: false }).limit(50);
          setDeliveries(data || []);
        }} />
      <WebhookDebugger webhook={debugging} open={!!debugging} onClose={() => setDebugging(null)}
        onSent={() => { if (debugging) setSelected(debugging.id); }} />
    </AdminPageShell>
  );
}
