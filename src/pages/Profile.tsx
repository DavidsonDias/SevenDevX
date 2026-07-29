/**
 * Profile.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/Profile.tsx
 * @module Public
 * @route /profile
 *
 * @description
 * Perfil do usuário autenticado: dados, papéis e estatísticas.
 *
 * @see src/pages/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Save, User as UserIcon, Mail, ArrowLeft, Shield, Calendar,
  KeyRound, LogOut, ImageIcon, Sparkles, CheckCircle2, Copy, Compass,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import GlassCard from "@/components/GlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";

type ProfileFormState = { fullName: string; bio: string; avatarUrl: string };

const Profile = () => {
  const { user, isAdmin, signOut } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { reset: resetTour } = useOnboarding("admin_dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({ fullName: "", bio: "", avatarUrl: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
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
      } catch {
        toast({ title: "Erro ao carregar perfil", description: "Tente novamente.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast, user]);

  const onChange = (key: keyof ProfileFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
    };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const payload = {
        full_name: form.fullName.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatarUrl.trim() || null,
      };
      const { data: existing } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
      const { error } = existing
        ? await supabase.from("profiles").update(payload).eq("user_id", user.id)
        : await supabase.from("profiles").insert({ user_id: user.id, ...payload });
      if (error) throw error;
      toast({ title: "Perfil atualizado", description: "Seus dados foram salvos com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({ title: "E-mail enviado", description: "Verifique sua caixa de entrada para redefinir a senha." });
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Não foi possível enviar.", variant: "destructive" });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const copyId = async () => {
    if (!user?.id) return;
    await navigator.clipboard.writeText(user.id);
    toast({ title: "ID copiado", description: "ID do usuário copiado para a área de transferência." });
  };

  const initials = useMemo(() => {
    const src = form.fullName || user?.email || "U";
    return src.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "U";
  }, [form.fullName, user?.email]);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const lastSignIn = (user as any)?.last_sign_in_at
    ? new Date((user as any).last_sign_in_at).toLocaleString("pt-BR")
    : "—";

  const completion = useMemo(() => {
    let score = 0;
    if (form.fullName.trim()) score += 33;
    if (form.bio.trim()) score += 34;
    if (form.avatarUrl.trim()) score += 33;
    return Math.min(100, score);
  }, [form]);

  return (
    <>
      <SEOHead title="Perfil - SevenDevX" description="Visualize e edite seus dados pessoais" url="https://www.sevendevx.com/profile" />
      <div className="relative min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 overflow-hidden">
        {/* Backdrop */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-white/[0.04] rounded-full blur-[140px]" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-white/[0.03] rounded-full blur-[140px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-16">
          <motion.button
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </motion.button>

          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-6 sm:p-8 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-white/20 shadow-2xl">
                    <AvatarImage src={form.avatarUrl || undefined} alt={form.fullName || user?.email || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-white/15 to-white/5 text-2xl font-orbitron">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron truncate">
                      {form.fullName || user?.email?.split("@")[0] || "Usuário"}
                    </h1>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border border-amber-400/40 text-amber-300 bg-amber-400/10">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border border-emerald-400/30 text-emerald-300 bg-emerald-400/10">
                      <CheckCircle2 className="w-3 h-3" /> Ativo
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>

                  {/* Completion bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Perfil completo
                      </span>
                      <span className="text-xs font-semibold tabular-nums">{completion}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-white/80 via-white to-white/80"
                        initial={{ width: 0 }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                <Calendar className="w-3 h-3" /> Membro desde
              </div>
              <p className="text-sm font-semibold">{memberSince}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                <KeyRound className="w-3 h-3" /> Último acesso
              </div>
              <p className="text-sm font-semibold truncate">{lastSignIn}</p>
            </GlassCard>
            <GlassCard className="p-4 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                <UserIcon className="w-3 h-3" /> ID
              </div>
              <button
                onClick={copyId}
                className="text-sm font-mono truncate w-full text-left hover:text-foreground transition-colors flex items-center gap-1.5"
                title="Copiar ID"
              >
                <span className="truncate">{user?.id?.slice(0, 12)}…</span>
                <Copy className="w-3 h-3 opacity-60" />
              </button>
            </GlassCard>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <GlassCard className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold font-orbitron">Dados pessoais</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Essas informações podem aparecer publicamente no site.
                  </p>
                </div>

                {isLoading ? (
                  <div className="py-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <form onSubmit={onSave} className="space-y-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Nome completo
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text" value={form.fullName} onChange={onChange("fullName")} placeholder="Seu nome"
                          className="w-full pl-11 pr-4 py-3 bg-secondary/60 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 focus:bg-secondary transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email" value={user?.email || ""} disabled
                          className="w-full pl-11 pr-4 py-3 bg-secondary/40 border border-border rounded-lg text-sm opacity-60 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">O e-mail não pode ser alterado por aqui.</p>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Bio
                      </label>
                      <textarea
                        value={form.bio} onChange={onChange("bio")} rows={4}
                        placeholder="Conte um pouco sobre você, sua experiência e seus interesses."
                        className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 focus:bg-secondary transition-all resize-none"
                        maxLength={500}
                      />
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] text-muted-foreground tabular-nums">{form.bio.length}/500</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Avatar URL
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="url" value={form.avatarUrl} onChange={onChange("avatarUrl")}
                          placeholder="https://exemplo.com/avatar.jpg"
                          className="w-full pl-11 pr-4 py-3 bg-secondary/60 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 focus:bg-secondary transition-all"
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit" disabled={isSaving}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 bg-foreground text-background font-bold uppercase tracking-[0.2em] text-xs hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar alterações</>}
                    </motion.button>
                  </form>
                )}
              </GlassCard>
            </motion.div>

            {/* Side: account actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h3 className="text-sm font-bold font-orbitron mb-1">Segurança</h3>
                <p className="text-xs text-muted-foreground mb-4">Gerencie acesso e credenciais.</p>
                <button
                  onClick={handlePasswordReset}
                  disabled={isSendingReset}
                  className="group w-full flex items-center justify-between gap-3 px-4 py-3 border border-border rounded-lg text-xs uppercase tracking-wider hover:bg-white/5 hover:border-foreground/30 transition-all disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> Redefinir senha
                  </span>
                  {isSendingReset ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeft className="w-3.5 h-3.5 rotate-180 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />}
                </button>
              </GlassCard>

              {isAdmin && (
                <GlassCard className="p-6">
                  <h3 className="text-sm font-bold font-orbitron mb-1 flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Tour Guiado
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Refaça o walkthrough inicial do SevenOS.</p>
                  <button
                    onClick={async () => { await resetTour(); toast({ title: "Tour reiniciado", description: "Abra o painel Admin para começar." }); }}
                    className="w-full px-4 py-3 border border-border rounded-lg text-xs uppercase tracking-wider hover:bg-white/5 transition-all"
                  >
                    Refazer tour
                  </button>
                </GlassCard>
              )}

              {isAdmin && (
                <GlassCard className="p-6 border-amber-400/20">
                  <h3 className="text-sm font-bold font-orbitron mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-300" /> Área Admin
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Acesso privilegiado ao SevenOS.</p>
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full px-4 py-3 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-lg text-xs uppercase tracking-wider hover:bg-amber-400/15 transition-all"
                  >
                    Abrir SevenOS
                  </button>
                </GlassCard>
              )}

              <GlassCard className="p-6 border-red-500/20">
                <h3 className="text-sm font-bold font-orbitron mb-1">Sessão</h3>
                <p className="text-xs text-muted-foreground mb-4">Sair desta conta neste dispositivo.</p>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/30 text-red-300 rounded-lg text-xs uppercase tracking-wider hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Encerrar sessão
                </button>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
