/**
 * 🚀 WhatsAppInboxAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/WhatsAppInboxAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/whatsapp
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Inbox do WhatsApp Business (Meta Cloud API).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `WhatsAppInboxAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Lê/escreve nas tabelas: `whatsapp_threads`, `whatsapp_messages`
 * ✅ Aciona Edge Functions: `whatsapp-send`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * WhatsAppInboxAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
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
 * 💬 WhatsApp Business Inbox — bidirectional inbox via Meta Cloud API.
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Loader2, Phone, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Thread {
  id: string;
  contact_phone: string;
  contact_name: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  status: string;
}
interface Msg {
  id: string;
  direction: "in" | "out";
  body: string | null;
  status: string;
  created_at: string;
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function WhatsAppInboxAdmin() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const loadThreads = async () => {
    setLoading(true);
    const { data } = await supabase.from("whatsapp_threads")
      .select("*").order("last_message_at", { ascending: false }).limit(100);
    setThreads((data || []) as Thread[]);
    setLoading(false);
  };

  const loadMessages = async (t: Thread) => {
    setActive(t);
    const { data } = await supabase.from("whatsapp_messages")
      .select("*").eq("thread_id", t.id).order("created_at", { ascending: true });
    setMessages((data || []) as Msg[]);
    if (t.unread_count > 0) {
      await supabase.from("whatsapp_threads").update({ unread_count: 0 }).eq("id", t.id);
    }
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { loadThreads(); }, []);

  useEffect(() => {
    if (!active) return;
    const ch = supabase.channel(`wa-${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "whatsapp_messages", filter: `thread_id=eq.${active.id}` },
        (p) => setMessages(m => [...m, p.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active?.id]);

  const send = async () => {
    if (!draft.trim() || !active) return;
    setSending(true);
    const { error } = await supabase.functions.invoke("whatsapp-send", {
      body: { thread_id: active.id, body: draft.trim() },
    });
    setSending(false);
    if (!error) { setDraft(""); loadThreads(); }
  };

  return (
    <AdminPageShell title="WhatsApp Business" subtitle="Inbox bidirecional · Meta Cloud API">
      <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Threads list */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 flex flex-col">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-white/60">Conversas</p>
            <button onClick={loadThreads} className="p-1.5 rounded-md hover:bg-white/5">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="p-4 text-xs text-white/50">Carregando…</div>}
            {!loading && threads.length === 0 && (
              <div className="p-6 text-center text-xs text-white/40">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Nenhuma conversa ainda.
              </div>
            )}
            {threads.map(t => (
              <button key={t.id} onClick={() => loadMessages(t)}
                className={`w-full text-left px-3 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${active?.id === t.id ? "bg-white/10" : ""}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{t.contact_name || t.contact_phone}</p>
                  {t.unread_count > 0 && (
                    <span className="text-[10px] bg-emerald-500 text-black rounded-full px-1.5 py-0.5 font-bold">
                      {t.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 truncate">{t.last_message_preview || "—"}</p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true, locale: ptBR })}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="border border-white/10 rounded-2xl bg-black/40 flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Selecione uma conversa
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{active.contact_name || active.contact_phone}</p>
                  <p className="text-[10px] text-white/40">{active.contact_phone}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <AnimatePresence initial={false}>
                  {messages.map(m => (
                    <motion.div key={m.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        m.direction === "out"
                          ? "bg-emerald-600/80 text-white rounded-br-sm"
                          : "bg-white/10 text-white rounded-bl-sm"
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className="text-[9px] opacity-60 mt-1">
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {m.direction === "out" && ` · ${m.status}`}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={endRef} />
              </div>
              <div className="p-3 border-t border-white/10 flex gap-2">
                <input value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Digite uma mensagem…"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <button onClick={send} disabled={sending || !draft.trim()}
                  className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 max-w-3xl text-xs text-white/60 border border-emerald-400/20 rounded-xl p-4 bg-emerald-400/[0.04]">
        <p className="font-medium text-white mb-2">⚙️ Configuração 100% in-app</p>
        <p className="mb-3">Token, Phone ID e Verify Token agora ficam em <a href="/admin/integrations" className="underline text-emerald-300">Integrações → WhatsApp Business</a>. Sem precisar mexer no Lovable Cloud.</p>
        <p className="text-white/40">Webhook do Meta: <code className="text-emerald-300">/functions/v1/whatsapp-webhook</code></p>
      </div>
    </AdminPageShell>
  );
}
