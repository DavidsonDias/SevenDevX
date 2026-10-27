/** Resolve only a notification belonging to the signed-in account, after the admin guard. */
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { notificationPath } from "@/lib/notification-links";
export default function NotificationOpen() {
  const { id } = useParams(),
    { user } = useAuthContext(),
    navigate = useNavigate();
  const userId=user?.id;
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (userId && id)
      void (async () => {
        const result = await supabase
          .from("notifications")
          .select("id,url")
          .eq("id", id)
          .eq("user_id", userId)
          .maybeSingle();
        if (!active) return;
        if (result.error || !result.data) {
          setError("Este aviso não está disponível para esta conta.");
          return;
        }
        const read = await supabase
          .from("notifications")
          .update({ read_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", userId);
        if (!active) return;
        if (read.error) {
          setError("Não foi possível confirmar a leitura. Tente novamente.");
          return;
        }
        navigate(notificationPath(result.data.url), { replace: true });
      })();
    return () => {
      active = false;
    };
  }, [userId, id, navigate]);
  return (
    <main className="p-6">
      <p role="status">{error || "Abrindo sua notificação…"}</p>
      <Link to="/admin/notifications">Central de notificações</Link>
    </main>
  );
}
