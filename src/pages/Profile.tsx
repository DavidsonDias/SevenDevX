/**
 * 👤 Profile - Página de Perfil do Usuário
 * SevenDevX Enterprise Edition
 */

import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Save, User as UserIcon, Mail } from "lucide-react";

import SEOHead from "@/components/SEOHead";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ProfileFormState = {
  fullName: string;
  bio: string;
  avatarUrl: string;
};

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const redirectUrl = useMemo(() => {
    const url = new URL(window.location.href);
    return `/auth?redirect=${encodeURIComponent(url.pathname)}`;
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<ProfileFormState>({
    fullName: "",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, bio, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        setForm({
          fullName: data?.full_name ?? user.user_metadata?.full_name ?? "",
          bio: data?.bio ?? "",
          avatarUrl: data?.avatar_url ?? "",
        });
      } catch (err: any) {
        console.error("[Profile] load error:", err);
        toast({
          title: "Erro ao carregar perfil",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [toast, user]);

  const onChange = (key: keyof ProfileFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Tenta update; se não existir linha (caso extremo), faz insert
      const updatePayload = {
        full_name: form.fullName.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatarUrl.trim() || null,
      };

      const { data: existing, error: selectError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (selectError) throw selectError;

      const { error } = existing
        ? await supabase
            .from("profiles")
            .update(updatePayload)
            .eq("user_id", user.id)
        : await supabase
            .from("profiles")
            .insert({ user_id: user.id, ...updatePayload });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram salvos com sucesso.",
      });
    } catch (err: any) {
      console.error("[Profile] save error:", err);
      toast({
        title: "Erro ao salvar",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectUrl} replace />;
  }

  return (
    <>
      <SEOHead
        title="Perfil - SevenDevX"
        description="Visualize e edite seus dados pessoais na SevenDevX"
        url="https://www.sevendevx.com/profile"
      />

      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-white/3 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl relative z-10"
        >
          <GlassCard className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold font-orbitron">Seu Perfil</h1>
              <p className="text-white/60 text-sm mt-2">
                Atualize seus dados pessoais.
              </p>
            </div>

            {isLoading ? (
              <div className="py-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : (
              <form onSubmit={onSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome completo
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={onChange("fullName")}
                      placeholder="Seu nome"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder:text-white/40 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={onChange("bio")}
                    placeholder="Conte um pouco sobre você"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder:text-white/40 focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Avatar URL (opcional)
                  </label>
                  <input
                    type="url"
                    value={form.avatarUrl}
                    onChange={onChange("avatarUrl")}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg placeholder:text-white/40 focus:outline-none focus:border-white/30"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSaving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
};

export default Profile;
