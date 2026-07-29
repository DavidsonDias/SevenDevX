/**
 * ClientPicker.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/ClientPicker.tsx
 * @module SevenOS/UI
 *
 * @description
 * Seletor de cliente reutilizado pelos formulários administrativos.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🔗 ClientPicker — autocomplete + criar cliente inline
 * Vincula um cliente a um projeto.
 */
import { useState, useMemo } from "react";
import { Search, Plus, X, Building2, Mail, Check, User as UserIcon } from "lucide-react";
import { useClients, useUpsertClient } from "@/hooks/useEcosystem";
import { Link } from "react-router-dom";

interface Props {
  value?: string | null;
  onChange: (clientId: string | null) => void;
}

export default function ClientPicker({ value, onChange }: Props) {
  const { data: clients = [] } = useClients();
  const upsert = useUpsertClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", company: "", email: "" });

  const linked = useMemo(() => clients.find((c: any) => c.id === value), [clients, value]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return clients.filter((c: any) =>
      [c.name, c.company, c.email].filter(Boolean).join(" ").toLowerCase().includes(s)
    );
  }, [clients, search]);

  const handleCreate = async () => {
    if (!newClient.name.trim()) return;
    const created: any = await upsert.mutateAsync({ ...newClient, status: "lead" });
    onChange(created.id);
    setCreating(false);
    setOpen(false);
    setNewClient({ name: "", company: "", email: "" });
  };

  if (linked) {
    return (
      <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4 text-purple-300" />
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">{linked.name}</p>
              {linked.company && (
                <p className="text-xs text-white/60 truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {linked.company}
                </p>
              )}
              {linked.email && (
                <p className="text-[11px] text-white/50 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {linked.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onChange(null)}
            className="text-white/40 hover:text-red-400 shrink-0"
            title="Desvincular"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/admin/clients`}
            className="flex-1 text-center text-xs px-3 py-1.5 border border-white/15 rounded hover:bg-white/5"
          >
            Ver cliente →
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="text-xs px-3 py-1.5 border border-white/15 rounded hover:bg-white/5"
          >
            Trocar
          </button>
        </div>

        {open && <PickerModal />}
      </div>
    );
  }

  function PickerModal() {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h4 className="font-bold text-sm">{creating ? "Novo cliente" : "Selecionar cliente"}</h4>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
          </div>

          {creating ? (
            <div className="p-4 space-y-3">
              <input
                autoFocus
                placeholder="Nome *"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"
              />
              <input
                placeholder="Empresa"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setCreating(false)}
                  className="flex-1 px-3 py-2 border border-white/15 rounded text-sm"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newClient.name.trim() || upsert.isPending}
                  className="flex-1 px-3 py-2 bg-white text-black rounded text-sm font-bold disabled:opacity-50"
                >
                  Criar e vincular
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative p-3 border-b border-white/10">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nome, empresa, email…"
                  className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"
                />
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-sm text-white/50 text-center p-6">Nenhum cliente encontrado.</p>
                ) : (
                  filtered.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => { onChange(c.id); setOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/5 border-b border-white/5 flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-white/50 truncate">
                          {c.company || c.email || "—"}
                        </p>
                      </div>
                      {c.id === value && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-white/10">
                <button
                  onClick={() => setCreating(true)}
                  className="w-full px-3 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Novo cliente
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-dashed border-white/15 rounded-xl p-4 bg-white/[0.02]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <UserIcon className="w-4 h-4 text-white/40" />
        </div>
        <div>
          <p className="text-sm font-medium">Nenhum cliente vinculado</p>
          <p className="text-xs text-white/50">Vincule um cliente para ativar a IA contextual.</p>
        </div>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="w-full px-3 py-2 bg-white text-black rounded-lg text-sm font-bold inline-flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Vincular cliente
      </button>
      {open && <PickerModal />}
    </div>
  );
}
