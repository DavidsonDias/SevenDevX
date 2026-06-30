/**
 * 📦 BackupAdmin v2 — backup completo (ZIP) ou por domínio.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { Database, Download, Trash2, Loader2, Plus, Package, FolderArchive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

const DOMAINS = [
  { id: "projects", label: "Projetos & Tech", icon: "📁" },
  { id: "crm", label: "CRM & Pipeline", icon: "👥" },
  { id: "finance", label: "Financeiro", icon: "💰" },
  { id: "cms", label: "CMS (Site)", icon: "📝" },
  { id: "ops", label: "Operações", icon: "⚙️" },
  { id: "branding", label: "Branding & Logos", icon: "🎨" },
  { id: "integrations", label: "Integrações", icon: "🔌" },
  { id: "automations", label: "Automações", icon: "🤖" },
  { id: "security", label: "Segurança & Settings", icon: "🛡️" },
];

export default function BackupAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("tenant_backups").select("*").order("created_at", { ascending: false });
    setItems(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (domain?: string) => {
    setRunning(domain || "full");
    try {
      const { data, error } = await supabase.functions.invoke("tenant-export", { body: domain ? { domain } : {} });
      if (error) throw error;
      toast({ title: `Backup ${domain || "completo"} gerado`, description: `${((data as any).size / 1024).toFixed(1)} KB` });
      await load();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message, variant: "destructive" });
    } finally { setRunning(null); }
  };

  const download = async (path: string) => {
    const { data } = await supabase.storage.from("backups").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const remove = async (b: any) => {
    if (!confirm("Remover este backup?")) return;
    await supabase.storage.from("backups").remove([b.storage_path]);
    await supabase.from("tenant_backups").delete().eq("id", b.id);
    load();
  };

  return (
    <AdminPageShell title="Backups" subtitle="ZIP completo do tenant + backups granulares por domínio"
      actions={
        <button onClick={() => create()} disabled={!!running}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold disabled:opacity-50">
          {running === "full" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          {running === "full" ? "Gerando ZIP completo..." : "Backup completo (ZIP)"}
        </button>
      }>
      {/* 🗂️ Por domínio */}
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-3">Backup por domínio · ZIP isolado</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {DOMAINS.map((d) => (
            <button key={d.id} onClick={() => create(d.id)} disabled={!!running}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-left disabled:opacity-40 transition-colors">
              <span className="text-lg">{d.icon}</span>
              <span className="text-xs flex-1 truncate">{d.label}</span>
              {running === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3 text-white/30" />}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-3">Histórico</p>
      {loading ? <div className="py-20 text-center text-white/40">Carregando...</div> :
       items.length === 0 ? (
        <div className="py-24 text-center text-white/30">
          <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
          Nenhum backup ainda.
        </div>
       ) : (
        <div className="space-y-2">
          {items.map((b) => {
            const isZip = b.storage_path?.endsWith(".zip");
            const kind = String(b.triggered_kind || "").replace("manual:", "");
            return (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                {isZip ? <FolderArchive className="w-4 h-4 text-emerald-300" /> : <Database className="w-4 h-4 text-white/40" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono truncate flex items-center gap-2">
                    {b.storage_path}
                    {kind && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/15 text-white/60">{kind}</span>}
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">
                    {formatDistanceToNow(new Date(b.created_at), { addSuffix: true, locale: ptBR })} ·
                    {" "}{(b.size_bytes / 1024).toFixed(1)} KB ·
                    {" "}{b.tables_included?.length ?? 0} tabelas
                  </div>
                </div>
                <button onClick={() => download(b.storage_path)} className="p-2 rounded hover:bg-white/10" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => remove(b)} className="p-2 rounded hover:bg-red-500/20 text-red-300" title="Remover">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
       )}
    </AdminPageShell>
  );
}
