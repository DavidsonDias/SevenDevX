/**
 * 👥 UsersAdmin — Gestão de usuários e papéis (RBAC enterprise)
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Users, Shield, Loader2, Search, Plus, X, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import UserDetailsModal from "@/modules/users/UserDetailsModal";

type UserRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
};

const ALL_ROLES = ["super_admin", "admin", "manager", "moderator", "editor", "viewer", "user"] as const;

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  admin: "bg-red-500/15 text-red-300 border-red-500/30",
  manager: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  moderator: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  editor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  viewer: "bg-white/10 text-white/70 border-white/20",
  user: "bg-white/5 text-white/50 border-white/10",
};

function UsersInner() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: me } = useAuthContext();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users" as any);
      if (error) throw error;
      return (data || []) as UserRow[];
    },
  });

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) =>
      u.email?.toLowerCase().includes(t) || u.full_name?.toLowerCase().includes(t),
    );
  }, [users, search]);

  const setRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await supabase.rpc("admin_set_role" as any, { _user_id: user_id, _role: role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Papel adicionado" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const removeRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await supabase.rpc("admin_remove_role" as any, { _user_id: user_id, _role: role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Papel removido" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminPageShell
      title="Usuários & Permissões"
      subtitle="Controle RBAC de toda a equipe SevenOS"
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email ou nome..."
            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="text-xs text-white/50 flex items-center px-3 border border-white/10 rounded-lg">
          <Users className="w-3.5 h-3.5 mr-2" /> {users.length} usuários
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((u, i) => (
            <motion.div
              key={u.user_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-sm font-semibold uppercase shrink-0">
                    {(u.full_name || u.email || "?").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate flex items-center gap-2">
                      {u.full_name || u.email}
                      {u.user_id === me?.id && <Crown className="w-3.5 h-3.5 text-yellow-300" />}
                    </p>
                    <p className="text-xs text-white/50 truncate">{u.email}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Último login: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("pt-BR") : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {u.roles.map((r) => (
                    <span
                      key={r}
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${ROLE_COLORS[r] || ROLE_COLORS.user}`}
                    >
                      <Shield className="w-2.5 h-2.5" /> {r}
                      <button
                        onClick={() => removeRole.mutate({ user_id: u.user_id, role: r })}
                        className="ml-1 hover:text-white"
                        title="Remover papel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setRole.mutate({ user_id: u.user_id, role: e.target.value });
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="text-[10px] uppercase tracking-wider px-2 py-1 bg-black/30 border border-white/10 rounded hover:bg-white/5"
                  >
                    <option value="">+ Papel</option>
                    {ALL_ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-xs text-white/40 mt-6">
        Para convidar novos usuários, peça que se cadastrem em <code className="text-white/60">/auth</code> — depois atribua os papéis aqui.
      </p>
    </AdminPageShell>
  );
}

export default function UsersAdmin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UsersInner />
    </ProtectedRoute>
  );
}
