/**
 * 👥 ClientsAdmin — CRM de clientes (perfil + timeline + IA + projetos + contrato + anexos)
 */
import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, Search, Building2, Mail, Phone, Sparkles, X, Edit2, Trash2,
  MessageCircle, FileText, Calendar, Loader2, Save, FolderKanban,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import {
  useClients, useUpsertClient, useDeleteClient, useClient,
  useClientInteractions, useAddInteraction, useAiGenerate,
} from "@/hooks/useEcosystem";
import ContractCard from "@/components/admin/ContractCard";
import AttachmentManager from "@/components/admin/AttachmentManager";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  qualified: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  finished: "bg-white/10 text-white/60 border-white/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/30",
};
const STATUS_LABEL: Record<string, string> = {
  lead: "Lead", qualified: "Qualificado", active: "Ativo", finished: "Finalizado", lost: "Perdido",
};

export default function ClientsAdmin() {
  const { data: clients = [], isLoading } = useClients();
  const upsert = useUpsertClient();
  const del = useDeleteClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      clients.filter((c: any) =>
        [c.name, c.company, c.email, c.segment].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
      ),
    [clients, search]
  );

  return (
    <AdminPageShell
      title="Clientes"
      subtitle={`${clients.length} no CRM`}
      actions={
        <button
          onClick={() => setEditing({ status: "lead" })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" /> Novo
        </button>
      }
    >
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente, empresa, email…"
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-white/30 outline-none"
        />
      </div>

      {isLoading ? (
        <p className="text-white/50">Carregando…</p>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-white/30" />
          <p className="text-white/60">Nenhum cliente ainda. Crie o primeiro.</p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              onClick={() => setDrawerId(c.id)}
              className="p-5 cursor-pointer h-full bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{c.name}</h3>
                    {c.company && <p className="text-sm text-white/60 truncate">{c.company}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-wider shrink-0 ${STATUS_COLORS[c.status] || ""}`}>
                    {STATUS_LABEL[c.status] || c.status}
                  </span>
                </div>
                {c.email && (
                  <p className="text-xs text-white/50 truncate flex items-center gap-1.5"><Mail className="w-3 h-3" />{c.email}</p>
                )}
                {c.phone && (
                  <p className="text-xs text-white/50 truncate flex items-center gap-1.5 mt-1"><Phone className="w-3 h-3" />{c.phone}</p>
                )}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(c); }}
                    className="flex-1 text-xs py-1.5 border border-white/15 rounded hover:bg-white/5 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Excluir ${c.name}?`)) del.mutate(c.id);
                    }}
                    className="text-xs py-1.5 px-3 border border-red-500/20 text-red-400 rounded hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
            </motion.div>
          ))}
        </div>
      )}

      {editing && (
        <ClientFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            await upsert.mutateAsync(payload);
            setEditing(null);
          }}
        />
      )}

      {drawerId && <ClientDrawer id={drawerId} onClose={() => setDrawerId(null)} />}
    </AdminPageShell>
  );
}

/* ─────────── form modal ─────────── */
function ClientFormModal({ initial, onClose, onSave }: any) {
  const [form, setForm] = useState<any>(initial);
  const change = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-bold">{initial.id ? "Editar Cliente" : "Novo Cliente"}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Nome *"><input className={inputCls} value={form.name || ""} onChange={(e) => change("name", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Empresa"><input className={inputCls} value={form.company || ""} onChange={(e) => change("company", e.target.value)} /></Field>
            <Field label="Segmento"><input className={inputCls} value={form.segment || ""} onChange={(e) => change("segment", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><input className={inputCls} type="email" value={form.email || ""} onChange={(e) => change("email", e.target.value)} /></Field>
            <Field label="Telefone"><input className={inputCls} value={form.phone || ""} onChange={(e) => change("phone", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp"><input className={inputCls} value={form.whatsapp || ""} onChange={(e) => change("whatsapp", e.target.value)} /></Field>
            <Field label="Faturamento (faixa)"><input className={inputCls} value={form.revenue_range || ""} onChange={(e) => change("revenue_range", e.target.value)} /></Field>
          </div>
          <Field label="Status">
            <select className={inputCls} value={form.status || "lead"} onChange={(e) => change("status", e.target.value)}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Notas">
            <textarea className={inputCls} rows={3} value={form.notes || ""} onChange={(e) => change("notes", e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 border border-white/20 rounded-lg text-sm">Cancelar</button>
          <button
            onClick={() => form.name && onSave(form)}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── drawer com timeline + IA ─────────── */
function ClientDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: client } = useClient(id);
  const { data: interactions = [] } = useClientInteractions(id);
  const addInter = useAddInteraction();
  const upsert = useUpsertClient();
  const ai = useAiGenerate();
  const { toast } = useToast();
  const [interForm, setInterForm] = useState({ type: "note", title: "", description: "" });

  const generateSummary = async () => {
    if (!client) return;
    const summary = await ai.mutateAsync({
      task: "client_summary",
      context: { client, interactions },
    });
    await upsert.mutateAsync({ id, ai_summary: summary, ai_summary_updated_at: new Date().toISOString() });
    toast({ title: "Resumo gerado pela IA" });
  };

  if (!client) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-zinc-950 border-l border-white/10 h-full overflow-y-auto">
        <div className="sticky top-0 bg-zinc-950 border-b border-white/10 p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg">{client.name}</h3>
            <p className="text-sm text-white/60">{client.company || client.email}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* IA Summary */}
          <div className="border border-purple-500/20 rounded-xl p-4 bg-purple-500/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Resumo IA</h4>
              <button
                onClick={generateSummary}
                disabled={ai.isPending}
                className="text-xs px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded hover:bg-purple-500/30 inline-flex items-center gap-1.5"
              >
                {ai.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {client.ai_summary ? "Regenerar" : "Gerar"}
              </button>
            </div>
            {client.ai_summary ? (
              <div className="prose prose-sm prose-invert max-w-none text-white/80">
                <ReactMarkdown>{client.ai_summary}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-white/50">Clique em Gerar para criar um resumo estratégico do cliente.</p>
            )}
          </div>

          {/* Projects vinculados */}
          <ClientProjects clientId={id} />

          {/* Contract + Files */}
          <div className="grid sm:grid-cols-2 gap-4">
            <ContractCard
              entity="clients"
              id={id}
              data={client}
              entityName={client?.name || client?.company}
              aiContext={{
                client: {
                  name: client?.name,
                  company: client?.company,
                  email: client?.email,
                  segment: client?.segment,
                  document: (client as any)?.document,
                },
              }}
            />
            <div className="border border-white/10 rounded-xl p-4">
              <AttachmentManager
                title="Logo & Arquivos"
                clientId={id}
                defaultType="logo"
                allowedTypes={["logo", "file", "idea", "document"]}
                compact
              />
            </div>
          </div>

          {/* Add interaction */}
          <div className="border border-white/10 rounded-xl p-4">
            <h4 className="font-bold mb-3">Registrar Interação</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select className={inputCls} value={interForm.type} onChange={(e) => setInterForm({ ...interForm, type: e.target.value })}>
                <option value="note">Nota</option>
                <option value="meeting">Reunião</option>
                <option value="call">Ligação</option>
                <option value="proposal">Proposta</option>
                <option value="message">Mensagem</option>
                <option value="email">Email</option>
              </select>
              <input className={inputCls} placeholder="Título" value={interForm.title} onChange={(e) => setInterForm({ ...interForm, title: e.target.value })} />
            </div>
            <textarea className={inputCls} rows={2} placeholder="Descrição (opcional)" value={interForm.description} onChange={(e) => setInterForm({ ...interForm, description: e.target.value })} />
            <button
              onClick={async () => {
                if (!interForm.title) return;
                await addInter.mutateAsync({ ...interForm, client_id: id });
                setInterForm({ type: "note", title: "", description: "" });
              }}
              className="mt-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold"
            >
              Adicionar
            </button>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Timeline</h4>
            {interactions.length === 0 ? (
              <p className="text-sm text-white/50">Nenhuma interação registrada.</p>
            ) : (
              <div className="space-y-3">
                {interactions.map((it: any) => (
                  <div key={it.id} className="border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase tracking-wider text-white/50">{it.type}</span>
                      <span className="text-xs text-white/40">{new Date(it.occurred_at).toLocaleString("pt-BR")}</span>
                    </div>
                    <p className="font-medium text-sm">{it.title}</p>
                    {it.description && <p className="text-xs text-white/60 mt-1">{it.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-white/30 text-sm";
const Field = ({ label, children }: any) => (
  <div>
    <label className="text-xs uppercase tracking-wider text-white/50 mb-1 block">{label}</label>
    {children}
  </div>
);

/* ─────────── projetos vinculados ao cliente ─────────── */
function ClientProjects({ clientId }: { clientId: string }) {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["client_projects", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, slug, status, pipeline_stage, cover_image, updated_at")
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold flex items-center gap-2 text-sm">
          <FolderKanban className="w-4 h-4" /> Projetos
          <span className="text-xs text-white/40 font-normal">({projects.length})</span>
        </h4>
        <Link to="/admin/projects" className="text-[10px] text-white/50 hover:text-white/80">Todos →</Link>
      </div>
      {isLoading ? (
        <p className="text-xs text-white/50">Carregando…</p>
      ) : projects.length === 0 ? (
        <p className="text-xs text-white/50">Nenhum projeto vinculado.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p: any) => (
            <Link
              key={p.id}
              to={`/admin/projects/${p.id}`}
              className="flex items-center gap-3 p-2.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors group"
            >
              {p.cover_image && (
                <img src={p.cover_image} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate group-hover:underline">{p.title}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">
                  /{p.slug} · {p.pipeline_stage} · {p.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
