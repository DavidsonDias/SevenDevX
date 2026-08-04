/**
 * 🚀 UserDetailsModal.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/modules/users/UserDetailsModal.tsx
 * @module Users
 * @layer Feature Module
 * @status Active
 *
 * @description
 * Detalhe de usuário, papéis e sessões.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `UserDetailsModal`
 * ✅ Lê/escreve nas tabelas: `admin_sessions`, `audit_log`
 * ✅ Aciona Edge Functions: `admin-delete-user`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useScrollLock
 *    ↓
 * UserDetailsModal.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 * ✅ Sonner — feedback via toast
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
 * @see src/modules/users/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 👤 UserDetailsModal — Detalhe + ações enterprise por usuário
 * Protege Davidson/SevenDevX e o último admin contra exclusão.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Shield, Crown, Activity, Monitor, Mail, Trash2, KeyRound, Ban, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/useScrollLock";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type UserRow = {
  user_id: string; email: string; full_name: string | null; avatar_url: string | null;
  created_at: string; last_sign_in_at: string | null; roles: string[];
};

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const PROTECTED_EMAILS = ["davidson", "sevendevx"]; // qualquer email contendo isso

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ Alterações relevantes ficam registradas na trilha de auditoria.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
//

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const isProtected = (email?: string | null) =>
  !!email && PROTECTED_EMAILS.some((p) => email.toLowerCase().includes(p));

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function UserDetailsModal({
  user, allUsers, onClose, onChanged,
}: { user: UserRow | null; allUsers: UserRow[]; onClose: () => void; onChanged: () => void }) {
  useScrollLock(!!user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("admin_sessions").select("*").eq("user_id", user.user_id).order("last_seen_at", { ascending: false }).limit(10)
      .then(({ data }) => setSessions(data || []));
    supabase.from("audit_log").select("*").eq("actor_id", user.user_id).order("occurred_at", { ascending: false }).limit(15)
      .then(({ data }) => setAudit(data || []));
  }, [user?.user_id]);

  if (!user) return null;
  const protectedUser = isProtected(user.email);
  const adminCount = allUsers.filter((u) => u.roles.includes("admin") || u.roles.includes("super_admin")).length;
  const isLastAdmin = (user.roles.includes("admin") || user.roles.includes("super_admin")) && adminCount <= 1;

  const resetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/auth` });
    if (error) toast.error(error.message); else toast.success("Email de reset enviado");
  };
  const revokeSessions = async () => {
    await supabase.from("admin_sessions").update({ revoked_at: new Date().toISOString() } as any).eq("user_id", user.user_id);
    toast.success("Sessões revogadas"); onChanged();
  };
  const deleteUser = async () => {
    if (protectedUser) return toast.error("Usuário protegido — não pode ser removido");
    if (isLastAdmin) return toast.error("Não é possível remover o último admin");
    if (!confirm(`Remover definitivamente ${user.email}? Esta ação é registrada no audit log.`)) return;
    if (!confirm(`CONFIRMAR: remover ${user.email}?`)) return;
    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: user.user_id },
    });
    if (error || (data as any)?.error) {
      const msg = (data as any)?.error ?? error?.message ?? "Falha ao remover";
      toast.error("Erro", { description: msg });
      return;
    }
    toast.success(`Usuário removido: ${(data as any).deleted_email}`);
    onChanged();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-stretch sm:items-center justify-center sm:p-6"
        onClick={onClose}>
        <motion.div initial={{ y: 30, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="relative w-full sm:max-w-3xl sm:max-h-[85vh] h-full sm:h-auto bg-[#0a0a0a] sm:rounded-2xl border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="p-5 border-b border-white/10 flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-lg font-bold uppercase shrink-0">
              {(user.full_name || user.email).charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{user.full_name || user.email}</h2>
                {protectedUser && <Crown className="w-4 h-4 text-yellow-300" />}
              </div>
              <p className="text-sm text-white/60 truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {user.roles.map((r) => (
                  <span key={r} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/15 bg-white/5">{r}</span>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
          </header>

          {(protectedUser || isLastAdmin) && (
            <div className="mx-5 mt-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {protectedUser ? "Conta protegida do owner (SevenDevX) — não pode ser excluída." : "Único admin do sistema — impedido de remoção/perda de privilégio."}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 grid sm:grid-cols-2 gap-5">
            <section>
              <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2"><Monitor className="w-3.5 h-3.5" /> Sessões recentes</h3>
              {sessions.length === 0 ? <p className="text-white/40 text-sm">Sem sessões registradas.</p> : (
                <ul className="space-y-2">
                  {sessions.map((s) => {
                    const online = !s.revoked_at && (Date.now() - new Date(s.last_seen_at).getTime() < 120_000);
                    return (
                      <li key={s.id} className="p-3 rounded-lg border border-white/10 bg-white/[0.02] text-xs">
                        <div className="flex justify-between"><span className="font-mono">{s.browser || "?"} · {s.os || "?"}</span>
                          <span className={online ? "text-emerald-300" : "text-white/40"}>{online ? "● online" : s.revoked_at ? "revogada" : "offline"}</span>
                        </div>
                        <div className="text-white/40 mt-1">{s.ip || "—"} · {new Date(s.last_seen_at).toLocaleString("pt-BR")}</div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            <section>
              <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Atividade</h3>
              {audit.length === 0 ? <p className="text-white/40 text-sm">Sem atividade.</p> : (
                <ul className="space-y-2">
                  {audit.map((a) => (
                    <li key={a.id} className="p-3 rounded-lg border border-white/10 bg-white/[0.02] text-xs">
                      <div className="flex justify-between">
                        <span className="font-mono text-white/80">{a.action} · {a.table_name}</span>
                        <span className="text-white/40">{new Date(a.occurred_at).toLocaleTimeString("pt-BR")}</span>
                      </div>
                      {a.summary && <div className="text-white/50 mt-1">{a.summary}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <footer className="p-4 border-t border-white/10 flex flex-wrap gap-2 bg-black/40">
            <button onClick={resetPassword} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
              <KeyRound className="w-4 h-4" /> Reset senha
            </button>
            <button onClick={revokeSessions} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
              <Ban className="w-4 h-4" /> Revogar sessões
            </button>
            <a href={`mailto:${user.email}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm">
              <Mail className="w-4 h-4" /> Email
            </a>
            <button onClick={deleteUser} disabled={protectedUser || isLastAdmin}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
