/**
 * 🔔 NotificationsAdmin — histórico completo com filtros e ações em lote.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useNotifications } from "@/hooks/useNotifications";
import { Check, Trash2, Filter, Download, Settings2, Bell, AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const sevIcon: any = { info: Info, warning: AlertTriangle, error: AlertCircle, success: CheckCircle2 };
const sevColor: any = { info: "text-sky-300", warning: "text-amber-300", error: "text-red-300", success: "text-emerald-300" };

export default function NotificationsAdmin() {
  const { items, unread, loading, markRead, markAllRead, remove } = useNotifications(200);
  const [filter, setFilter] = useState<"all" | "unread" | "info" | "warning" | "error">("all");

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read_at;
    return n.severity === filter;
  });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `notifications-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPageShell title="Notificações" subtitle={`${unread} não lidas · ${items.length} totais`}
      actions={
        <div className="flex gap-2">
          <button onClick={exportJson} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 text-xs hover:bg-white/5">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <button onClick={markAllRead} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 text-xs hover:bg-white/5">
            <Check className="w-3.5 h-3.5" /> Marcar todas
          </button>
          <Link to="/admin/notifications/preferences" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-xs">
            <Settings2 className="w-3.5 h-3.5" /> Preferências
          </Link>
        </div>
      }>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(["all", "unread", "info", "warning", "error"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"
            }`}>
            {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : f}
          </button>
        ))}
      </div>
      {loading ? <div className="py-20 text-center text-white/40 text-sm">Carregando...</div> :
       filtered.length === 0 ? (
        <div className="py-24 text-center text-white/30">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          Nada por aqui.
        </div>
       ) : (
        <div className="space-y-1.5">
          {filtered.map((n) => {
            const Icon = sevIcon[n.severity] ?? Info;
            const color = sevColor[n.severity] ?? "text-white/60";
            return (
              <div key={n.id} className={`group flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                n.read_at ? "border-white/5 hover:border-white/10" : "border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.06]"
              }`}>
                <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-[10px] text-white/40 font-mono">{n.type}</span>
                    {!n.read_at && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  {n.body && <div className="text-xs text-white/50 mt-0.5">{n.body}</div>}
                  <div className="text-[10px] text-white/30 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })} · {new Date(n.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {n.url && <Link to={n.url} className="text-[11px] px-2 py-1 rounded border border-white/10 hover:bg-white/5">Abrir</Link>}
                  {!n.read_at && (
                    <button onClick={() => markRead(n.id)} className="p-1.5 rounded hover:bg-white/10" title="Marcar lida">
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-300" title="Remover">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
       )}
    </AdminPageShell>
  );
}
