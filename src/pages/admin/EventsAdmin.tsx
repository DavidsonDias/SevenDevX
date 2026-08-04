/**
 * 🚀 EventsAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/EventsAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/events
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Barramento de eventos internos.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `EventsAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `events`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * EventsAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
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
 * │ 📡 REALTIME                                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 📡 Assina canais Supabase Realtime e libera a inscrição no unmount
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
 * 📡 Events — barramento central realtime.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Activity, AlertTriangle, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Ev { id: string; type: string; source: string; payload: any; severity: string; actor_email: string | null; created_at: string; }

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SEV_COLOR: Record<string,string> = {
  info: "text-sky-400 border-sky-400/30 bg-sky-400/5",
  warn: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  error: "text-red-400 border-red-400/30 bg-red-400/5",
  critical: "text-red-400 border-red-400/40 bg-red-400/10",
};

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 📡 O estado local é reconciliado a cada evento Realtime recebido.
//

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function EventsAdmin() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    supabase.from("events").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setEvents((data || []) as any); setLoading(false); });

    const ch = supabase.channel("events-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (p) => {
        setEvents(prev => [p.new as any, ...prev].slice(0, 300));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = events.filter(e => !filter || e.type.includes(filter) || e.source.includes(filter));

  return (
    <AdminPageShell title="Eventos" subtitle="Barramento operacional · realtime · todos os sinais do sistema">
      <div className="flex items-center gap-3 mb-6">
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar por tipo ou origem..."
          className="flex-1 max-w-md bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {filtered.map(ev => {
              const Icon = ev.severity === "info" ? Info : AlertTriangle;
              return (
                <motion.div key={ev.id} layout
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/[0.03] text-sm">
                  <Icon className={`w-4 h-4 shrink-0 ${SEV_COLOR[ev.severity]?.split(" ")[0] || "text-white/40"}`} />
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${SEV_COLOR[ev.severity] || "text-white/40 border-white/10"} font-mono`}>{ev.type}</span>
                  <span className="text-white/50 text-xs">{ev.source}</span>
                  <span className="flex-1 text-white/40 text-xs truncate">{ev.actor_email || "system"}</span>
                  <span className="text-white/30 text-[11px] shrink-0">{new Date(ev.created_at).toLocaleTimeString("pt-BR")}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && <div className="text-center py-20 text-white/40">Nenhum evento ainda.</div>}
        </div>
      )}
    </AdminPageShell>
  );
}
