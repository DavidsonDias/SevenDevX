/**
 * 🖥️ SessionsAdmin — Sessões ativas em tempo real
 */
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { MonitorSmartphone, Smartphone, Monitor, Loader2, LogOut, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { pingSessionNow } from "@/hooks/useSessionTracker";

type Sess = {
  id: string; user_id: string; user_email: string | null;
  device: string | null; browser: string | null; os: string | null;
  ip: string | null; last_seen_at: string; created_at: string; revoked_at: string | null;
};

function SessionsInner() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["admin-sessions"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .is("revoked_at", null)
        .order("last_seen_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Sess[];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("admin-sessions-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_sessions" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-sessions"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("admin_revoke_session" as any, { _session_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sessions"] });
      toast({ title: "Sessão encerrada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const onlineCount = sessions.filter((s) => {
    const diff = (Date.now() - new Date(s.last_seen_at).getTime()) / 1000;
    return diff < 120;
  }).length;

  const revokeAll = useMutation({
    mutationFn: async () => {
      const ids = sessions.map((s) => s.id);
      await Promise.all(ids.map((id) => supabase.rpc("admin_revoke_session" as any, { _session_id: id })));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sessions"] });
      toast({ title: "Todas as sessões foram encerradas" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminPageShell
      title="Sessões Ativas"
      subtitle={`${sessions.length} sessões registradas · ${onlineCount} online agora`}
      actions={
        sessions.length > 1 ? (
          <button
            onClick={() => { if (confirm("Encerrar TODAS as sessões ativas?")) revokeAll.mutate(); }}
            disabled={revokeAll.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-300 text-xs uppercase tracking-wider hover:bg-red-500/10 disabled:opacity-50"
          >
            {revokeAll.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            Encerrar todas
          </button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="py-20 text-center text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-20 text-center text-white/40 border border-white/10 rounded-xl">
          <MonitorSmartphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma sessão ativa registrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {sessions.map((s) => {
              const diff = (Date.now() - new Date(s.last_seen_at).getTime()) / 1000;
              const isOnline = diff < 120;
              const Icon = s.device === "Mobile" ? Smartphone : Monitor;
              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <Icon className="w-8 h-8 text-white/60" />
                        {isOnline && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{s.user_email || s.user_id.slice(0, 8)}</p>
                        <p className="text-xs text-white/50">
                          {s.browser} · {s.os} · {s.device}
                        </p>
                        <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          {isOnline ? (
                            <span className="text-emerald-300">Online agora</span>
                          ) : (
                            <>Visto {formatDistanceToNow(new Date(s.last_seen_at), { locale: ptBR, addSuffix: true })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { if (confirm("Encerrar esta sessão?")) revoke.mutate(s.id); }}
                      className="p-2 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/10 shrink-0"
                      title="Encerrar"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </AdminPageShell>
  );
}

export default function SessionsAdmin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SessionsInner />
    </ProtectedRoute>
  );
}
