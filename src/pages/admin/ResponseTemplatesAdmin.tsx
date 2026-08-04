/**
 * 🚀 ResponseTemplatesAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/ResponseTemplatesAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/templates
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Modelos de resposta do contact center.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `ResponseTemplatesAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `response_templates`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * ResponseTemplatesAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
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
 * 💬 ResponseTemplatesAdmin — biblioteca de templates de resposta com merge tags.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Tpl = { id: string; name: string; category: string; subject: string | null; body: string; variables: string[]; usage_count: number };

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

export default function ResponseTemplatesAdmin() {
  const [items, setItems] = useState<Tpl[]>([]);
  const [sel, setSel] = useState<Tpl | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("response_templates").select("*").order("category").order("name");
    setItems((data as Tpl[]) ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const { data } = await supabase.from("response_templates").insert({ name: "Novo template", body: "Olá {{name}}, ...", category: "general", variables: ["name"] }).select().single();
    if (data) { setItems((p) => [data as Tpl, ...p]); setSel(data as Tpl); }
  };

  const save = async () => {
    if (!sel) return;
    const vars = Array.from(new Set((sel.body + " " + (sel.subject ?? "")).match(/\{\{([^}]+)\}\}/g)?.map((m) => m.slice(2,-2).trim()) ?? []));
    const { error } = await supabase.from("response_templates").update({
      name: sel.name, category: sel.category, subject: sel.subject, body: sel.body, variables: vars,
    }).eq("id", sel.id);
    if (!error) { toast({ title: "Salvo" }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover?")) return;
    await supabase.from("response_templates").delete().eq("id", id);
    setSel(null); load();
  };

  return (
    <AdminPageShell title="Templates de Resposta" subtitle="Use {{name}}, {{company}}, etc — substituição automática"
      actions={<button onClick={create} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-black text-xs font-bold"><Plus className="w-3.5 h-3.5" />Novo</button>}>
      {loading ? <div className="py-20 text-center text-white/40">Carregando...</div> : (
        <div className="grid md:grid-cols-[280px_1fr] gap-4">
          <div className="space-y-1">
            {items.map((t) => (
              <button key={t.id} onClick={() => setSel(t)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${sel?.id === t.id ? "border-white bg-white/5" : "border-white/10 hover:bg-white/5"}`}>
                <div className="text-sm font-medium truncate">{t.name}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{t.category} · {t.usage_count} usos</div>
              </button>
            ))}
            {items.length === 0 && <div className="text-center text-white/30 text-sm py-8"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />Vazio</div>}
          </div>

          {sel ? (
            <div className="space-y-3 p-4 rounded-xl border border-white/10">
              <div className="grid sm:grid-cols-2 gap-2">
                <input value={sel.name} onChange={(e) => setSel({ ...sel, name: e.target.value })} placeholder="Nome" className="px-3 py-2 rounded-lg bg-black border border-white/10 text-sm" />
                <input value={sel.category} onChange={(e) => setSel({ ...sel, category: e.target.value })} placeholder="Categoria" className="px-3 py-2 rounded-lg bg-black border border-white/10 text-sm" />
              </div>
              <input value={sel.subject ?? ""} onChange={(e) => setSel({ ...sel, subject: e.target.value })} placeholder="Assunto (opcional)" className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm" />
              <textarea value={sel.body} onChange={(e) => setSel({ ...sel, body: e.target.value })} rows={10}
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm font-mono" />
              <div className="text-[11px] text-white/40">Variáveis detectadas: {(sel.body.match(/\{\{[^}]+\}\}/g) ?? []).join(", ") || "—"}</div>
              <div className="flex gap-2">
                <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold"><Save className="w-3.5 h-3.5" />Salvar</button>
                <button onClick={() => remove(sel.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 text-xs"><Trash2 className="w-3.5 h-3.5" />Remover</button>
              </div>
            </div>
          ) : <div className="text-center text-white/30 text-sm py-20">Selecione um template ou crie um novo</div>}
        </div>
      )}
    </AdminPageShell>
  );
}
