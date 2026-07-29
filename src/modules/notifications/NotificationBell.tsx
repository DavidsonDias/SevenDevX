/**
 * NotificationBell.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/notifications/NotificationBell.tsx
 * @module Notifications
 *
 * @description
 * Sino de notificações com contagem em tempo real.
 *
 * @see src/modules/notifications/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🔔 NotificationBell — sino com badge, dropdown, realtime e ações inline.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, AlertCircle, Info, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const sevIcon = { info: Info, warning: AlertTriangle, error: AlertCircle, success: CheckCircle2 };
const sevColor = { info: "text-sky-300", warning: "text-amber-300", error: "text-red-300", success: "text-emerald-300" };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  const ref = useRef<HTMLDivElement>(null);
  const { items, unread, markRead, markAllRead, remove } = useNotifications(30);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = items.filter((n) => {
    if (filter === "unread") return !n.read_at;
    if (filter === "critical") return n.severity === "error" || n.severity === "warning";
    return true;
  });

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
        aria-label="Notificações">
        <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-red-500 to-amber-500 text-[10px] font-bold flex items-center justify-center border-2 border-[#0a0a0a]">
            {unread > 99 ? "99+" : unread}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.04] to-transparent">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-semibold">Notificações</span>
                {unread > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{unread} novas</span>}
              </div>
              <button onClick={markAllRead} className="text-[11px] text-white/50 hover:text-white inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> Marcar todas
              </button>
            </div>
            {/* Filters */}
            <div className="flex gap-1 px-3 py-2 border-b border-white/5">
              {(["all", "unread", "critical"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                    filter === f ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                  }`}>
                  {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Críticas"}
                </button>
              ))}
            </div>
            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/30">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Nada por aqui
                </div>
              ) : (
                filtered.map((n) => <Item key={n.id} n={n} onRead={markRead} onRemove={remove} onClose={() => setOpen(false)} />)
              )}
            </div>
            <Link to="/admin/notifications" onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-[11px] text-white/60 hover:text-white border-t border-white/10 bg-white/[0.02]">
              Ver histórico completo →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Item({ n, onRead, onRemove, onClose }: { n: Notification; onRead: (id: string) => void; onRemove: (id: string) => void; onClose: () => void }) {
  const Icon = sevIcon[n.severity] ?? Info;
  const color = sevColor[n.severity] ?? "text-white/60";
  const isUnread = !n.read_at;
  const body = (
    <div className={`group px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${isUnread ? "bg-amber-500/[0.03]" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${color}`}><Icon className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white/90 truncate">{n.title}</div>
          {n.body && <div className="text-[11px] text-white/50 mt-0.5 line-clamp-2">{n.body}</div>}
          <div className="text-[10px] text-white/30 mt-1">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          {isUnread && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRead(n.id); }}
              className="p-1 rounded hover:bg-white/10" title="Marcar lida">
              <Check className="w-3 h-3" />
            </button>
          )}
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(n.id); }}
            className="p-1 rounded hover:bg-red-500/20 hover:text-red-300" title="Remover">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />}
      </div>
    </div>
  );
  if (n.url) {
    return (
      <Link to={n.url} onClick={() => { onRead(n.id); onClose(); }} className="block">{body}</Link>
    );
  }
  return <div onClick={() => onRead(n.id)} className="cursor-pointer">{body}</div>;
}
