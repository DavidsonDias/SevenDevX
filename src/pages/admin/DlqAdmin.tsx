/**
 * ☠️ DlqAdmin — Dead Letter Queue de webhooks com replay.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { AlertOctagon, RotateCw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

export default function DlqAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Set<string>>(new Set());

  const load = async () => {
    const { data } = await supabase.from("webhook_dlq").select("*, webhooks(name, url)").order("moved_at", { ascending: false });
    setItems(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const replay = async (ids: string[]) => {
    for (const id of ids) {
      const item = items.find((i) => i.id === id);
      if (!item) continue;
      try {
        await supabase.functions.invoke("webhook-dispatch", {
          body: { webhook_id: item.webhook_id, event: item.event, payload: item.payload },
        });
        await supabase.from("webhook_dlq").update({ replayed_at: new Date().toISOString() }).eq("id", id);
      } catch (e) { /* keep going */ }
    }
    toast({ title: `${ids.length} reenviado(s)` });
    setSel(new Set()); load();
  };

  const remove = async (id: string) => {
    await supabase.from("webhook_dlq").delete().eq("id", id);
    load();
  };

  return (
    <AdminPageShell title="Dead Letter Queue" subtitle="Webhooks que falharam após todos os retries"
      actions={sel.size > 0 ? (
        <button onClick={() => replay([...sel])} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-black text-xs font-bold">
          <RotateCw className="w-3.5 h-3.5" />Reenviar {sel.size}
        </button>
      ) : null}>
      {loading ? <div className="py-20 text-center text-white/40">Carregando...</div> :
       items.length === 0 ? (
        <div className="py-24 text-center text-white/30">
          <AlertOctagon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          Nada na DLQ. Excelente!
        </div>
       ) : (
        <div className="space-y-2">
          {items.map((d) => (
            <div key={d.id} className={`p-3 rounded-xl border ${d.replayed_at ? "border-emerald-500/20 bg-emerald-500/[0.03]" : "border-red-500/20 bg-red-500/[0.03]"}`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={sel.has(d.id)} onChange={() => toggle(d.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.webhooks?.name ?? "—"} · <span className="font-mono text-xs text-white/50">{d.event}</span></div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {formatDistanceToNow(new Date(d.moved_at), { addSuffix: true, locale: ptBR })} · {d.attempts} tentativas
                    {d.replayed_at && <span className="text-emerald-300 ml-2">· reenviado</span>}
                  </div>
                  {d.last_error && <div className="text-[11px] text-red-300/80 mt-1 font-mono truncate">{d.last_error}</div>}
                </div>
                <button onClick={() => replay([d.id])} className="p-2 rounded hover:bg-white/10" title="Reenviar"><RotateCw className="w-4 h-4" /></button>
                <button onClick={() => remove(d.id)} className="p-2 rounded hover:bg-red-500/20 text-red-300" title="Remover"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
       )}
    </AdminPageShell>
  );
}
