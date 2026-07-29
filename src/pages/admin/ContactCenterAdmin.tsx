/**
 * ContactCenterAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/ContactCenterAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/contact-center
 *
 * @description
 * Mensagens recebidas e modelos de resposta.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📬 ContactCenterAdmin — Inbox de leads (estilo Intercom/HubSpot)
 * Realtime · status · notas internas · conversão em cliente
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Inbox, Mail, Phone, Building2, Search, UserCheck, Trash2, Send, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  service_type: string | null;
  budget: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  qualified: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  closed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost: "bg-red-500/15 text-red-300 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Novo", contacted: "Em contato", qualified: "Qualificado", closed: "Fechado", lost: "Perdido",
};

function ContactCenterInner() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [noteDraft, setNoteDraft] = useState("");

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contact-center"],
    staleTime: 10_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as Contact[];
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("contact-center-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, () => {
        qc.invalidateQueries({ queryKey: ["contact-center"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!term) return true;
      return (
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term) ||
        c.message?.toLowerCase().includes(term)
      );
    });
  }, [contacts, search, statusFilter]);

  const selected = useMemo(() => contacts.find((c) => c.id === selectedId) ?? filtered[0] ?? null, [contacts, filtered, selectedId]);

  useEffect(() => { setNoteDraft(selected?.notes ?? ""); }, [selected?.id]);

  const updateContact = useMutation({
    mutationFn: async (patch: Partial<Contact> & { id: string }) => {
      const { error } = await supabase.from("contacts").update(patch as any).eq("id", patch.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-center"] });
      toast({ title: "Atualizado" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const removeContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-center"] });
      setSelectedId(null);
      toast({ title: "Removido" });
    },
  });

  const convertToClient = useMutation({
    mutationFn: async (c: Contact) => {
      const { data, error } = await supabase.from("clients").insert({
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        contact_id: c.id,
        status: "lead",
        notes: c.message,
      } as any).select("id").single();
      if (error) throw error;
      await supabase.from("contacts").update({ status: "qualified" }).eq("id", c.id);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-center"] });
      toast({ title: "Cliente criado", description: "Lead convertido com sucesso" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const stats = useMemo(() => ({
    total: contacts.length,
    novos: contacts.filter((c) => c.status === "new").length,
    qualificados: contacts.filter((c) => c.status === "qualified").length,
    fechados: contacts.filter((c) => c.status === "closed").length,
  }), [contacts]);

  return (
    <AdminPageShell
      title="Central de Contatos"
      subtitle="Inbox realtime de leads · convertendo conversas em receita"
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Novos", value: stats.novos, color: "text-blue-300" },
          { label: "Qualificados", value: stats.qualificados, color: "text-violet-300" },
          { label: "Fechados", value: stats.fechados, color: "text-emerald-300" },
        ].map((k) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4"
          >
            <p className="text-[11px] uppercase tracking-wider text-white/50">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[calc(100vh-340px)]">
        {/* LISTA */}
        <aside className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar leads..."
                className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {["all", "new", "contacted", "qualified", "closed", "lost"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`shrink-0 px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-md border transition-colors ${
                    statusFilter === s ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {s === "all" ? "Todos" : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-white/40"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum contato</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {filtered.map((c) => (
                    <motion.li
                      key={c.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      onClick={() => setSelectedId(c.id)}
                      className={`p-3 cursor-pointer transition-colors ${
                        selected?.id === c.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                          <p className="text-xs text-white/50 truncate">{c.email}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${STATUS_COLORS[c.status] || ""}`}>
                          {STATUS_LABELS[c.status] || c.status}
                        </span>
                      </div>
                      {c.message && <p className="text-xs text-white/40 mt-1 line-clamp-2">{c.message}</p>}
                      <p className="text-[10px] text-white/30 mt-1.5">{new Date(c.created_at).toLocaleString("pt-BR")}</p>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </aside>

        {/* DETALHE */}
        <section className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Selecione um contato</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 border-b border-white/10">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <p className="text-sm text-white/60">{selected.email}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={selected.status}
                      onChange={(e) => updateContact.mutate({ id: selected.id, status: e.target.value as any })}
                      className="px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs uppercase tracking-wider"
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button
                      onClick={() => convertToClient.mutate(selected)}
                      disabled={convertToClient.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg text-xs uppercase tracking-wider hover:bg-white/90 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Converter em cliente
                    </button>
                    <button
                      onClick={() => { if (confirm("Remover contato?")) removeContact.mutate(selected.id); }}
                      className="p-1.5 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                  {selected.phone && <Info icon={Phone} label="Telefone" value={selected.phone} />}
                  {selected.company && <Info icon={Building2} label="Empresa" value={selected.company} />}
                  {selected.service_type && <Info icon={Mail} label="Serviço" value={selected.service_type} />}
                  {selected.budget && <Info icon={Mail} label="Orçamento" value={selected.budget} />}
                </div>
              </div>

              {selected.message && (
                <div className="p-5 border-b border-white/10">
                  <p className="text-[11px] uppercase tracking-wider text-white/50 mb-2">Mensagem</p>
                  <p className="text-sm whitespace-pre-wrap text-white/80">{selected.message}</p>
                </div>
              )}

              <div className="p-5">
                <p className="text-[11px] uppercase tracking-wider text-white/50 mb-2">Notas internas</p>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={5}
                  placeholder="Anotações privadas sobre este lead..."
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => updateContact.mutate({ id: selected.id, notes: noteDraft })}
                    disabled={updateContact.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 rounded-lg text-xs uppercase tracking-wider hover:bg-white/5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Salvar nota
                  </button>
                </div>
              </div>

              <div className="px-5 pb-5 text-[11px] text-white/40">
                Origem: <span className="text-white/60">{selected.source || "—"}</span> · Criado em{" "}
                {new Date(selected.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-white/40 mt-0.5" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
        <p className="text-white/80">{value}</p>
      </div>
    </div>
  );
}

export default function ContactCenterAdmin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ContactCenterInner />
    </ProtectedRoute>
  );
}
