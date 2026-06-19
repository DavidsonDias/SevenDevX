import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  severity: "info" | "warning" | "error" | "success";
  payload: any;
  read_at: string | null;
  created_at: string;
};

export function useNotifications(limit = 20) {
  const { user } = useAuthContext();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [{ data }, { count }] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(limit),
      supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
    ]);
    setItems((data ?? []) as any);
    setUnread(count ?? 0);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => {
    if (!user) return;
    refresh();
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, refresh]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  };
  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  };
  const remove = async (id: string) => { await supabase.from("notifications").delete().eq("id", id); };

  return { items, unread, loading, refresh, markRead, markAllRead, remove };
}
