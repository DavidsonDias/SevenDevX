/**
 * 📦 BackupAdmin — snapshots manuais + download.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { Database, Download, Trash2, Loader2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

export default function BackupAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("tenant_backups").select("*").order("created_at", { ascending: false });
    setItems(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("tenant-export", { body: {} });
      if (error) throw error;
      toast({ title: "Backup gerado", description: `${((data as any).size / 1024).toFixed(1)} KB` });
      await load();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message, variant: "destructive" });
    } finally { setRunning(false); }
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
    <AdminPageShell title="Backups" subtitle="Snapshots completos das tabelas do tenant em JSON"
      actions={
        <button onClick={create} disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold disabled:opacity-50">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {running ? "Gerando..." : "Novo backup"}
        </button>
      }>
      {loading ? <div className="py-20 text-center text-white/40">Carregando...</div> :
       items.length === 0 ? (
        <div className="py-24 text-center text-white/30">
          <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
          Nenhum backup ainda. Crie o primeiro acima.
        </div>
       ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <Database className="w-4 h-4 text-white/40" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono truncate">{b.storage_path}</div>
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
          ))}
        </div>
       )}
    </AdminPageShell>
  );
}
