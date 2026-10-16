/**
 * 🚀 DlqAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/DlqAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/webhooks/dlq
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Dead-letter queue de webhooks com reprocessamento.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `DlqAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `webhook_dlq`
 * ✅ Aciona Edge Functions: `webhook-dispatch`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * DlqAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ date-fns — formatação de datas
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS
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
 * @see src/pages/admin/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/AUTHORIZATION.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

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

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ⚠️ Exclusões são definitivas e exigem confirmação explícita antes do disparo.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
//

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function DlqAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Set<string>>(new Set());

  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.from("webhook_dlq").select("*, webhooks(name, url)").order("moved_at", { ascending: false });
      if (error) throw error;
      setItems(data ?? []);
    } catch {
      setLoadError("Não foi possível carregar a fila. Tente novamente mais tarde.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const replay = async (ids: string[]) => {
    if (busy) return;
    setBusy(true);
    let delivered = 0, recorded = 0, failed = 0;
    try {
      for (const id of [...new Set(ids)]) {
        const item = items.find((i) => i.id === id);
        if (!item) { failed++; continue; }
        try {
          const { data, error } = await supabase.functions.invoke("webhook-dispatch", {
            body: { webhook_id: item.webhook_id, event: item.event, payload: item.payload },
          });
          if (error || data?.ok !== true) { failed++; continue; }
          delivered++;
          const { data: updated, error: updateError } = await supabase.from("webhook_dlq")
            .update({ replayed_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
          if (!updateError && updated) recorded++;
        } catch { failed++; }
      }
      toast({
        title: `${delivered} entrega(s) confirmada(s)`,
        description: `${recorded} registro(s) atualizado(s); ${failed} item(ns) sem confirmação. ` +
          (delivered > recorded ? "Há entrega confirmada sem registro atualizado. Verifique o destino antes de reenviar para evitar duplicidade." : ""),
        ...(failed || delivered > recorded ? { variant: "destructive" as const } : {}),
      });
      setSel(new Set());
      await load();
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (busy || !window.confirm("Excluir este registro da fila definitivamente? Esta ação não pode ser desfeita.")) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("webhook_dlq").delete().eq("id", id).select("id").maybeSingle();
      if (error || !data) throw new Error("Delete not confirmed");
      setSel((selected) => { const next = new Set(selected); next.delete(id); return next; });
      await load();
    } catch {
      toast({ title: "Exclusão não confirmada", description: "Não foi possível confirmar a exclusão do registro.", variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <AdminPageShell title="Dead Letter Queue" subtitle="Webhooks que falharam após todos os retries"
      actions={!loadError && sel.size > 0 ? (
        <button disabled={busy || loading} onClick={() => replay([...sel])} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-black text-xs font-bold">
          <RotateCw className="w-3.5 h-3.5" />Reenviar {sel.size}
        </button>
      ) : null}>
      {loading ? <div className="py-20 text-center text-white/40">Carregando...</div> :
       loadError ? <div role="alert" className="py-12 text-red-300">{loadError}</div> :
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
                <input type="checkbox" disabled={busy} checked={sel.has(d.id)} onChange={() => toggle(d.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.webhooks?.name ?? "—"} · <span className="font-mono text-xs text-white/50">{d.event}</span></div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {formatDistanceToNow(new Date(d.moved_at), { addSuffix: true, locale: ptBR })} · {d.attempts} tentativas
                    {d.replayed_at && <span className="text-emerald-300 ml-2">· reenviado</span>}
                  </div>
                  {d.last_error && <div className="text-[11px] text-red-300/80 mt-1 font-mono truncate">{d.last_error}</div>}
                </div>
                <button disabled={busy} onClick={() => replay([d.id])} className="p-2 rounded hover:bg-white/10" title="Reenviar"><RotateCw className="w-4 h-4" /></button>
                <button disabled={busy} onClick={() => remove(d.id)} className="p-2 rounded hover:bg-red-500/20 text-red-300" title="Remover"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
       )}
    </AdminPageShell>
  );
}
