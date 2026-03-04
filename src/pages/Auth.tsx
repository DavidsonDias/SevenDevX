import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import GlassCard from "@/components/GlassCard";
import { getAuthErrorToast } from "@/utils/authErrors";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });

  useEffect(() => {
    if (user && !authLoading) {
      navigate(searchParams.get("redirect") || "/");
    }
  }, [user, authLoading, navigate, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => { fieldErrors[err.path[0]] = err.message; });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await signIn(formData.email, formData.password);
        if (error) {
          const info = getAuthErrorToast(error, "login");
          toast({ title: info.title, description: info.description, variant: "destructive" });
          return;
        }
        if (data?.session) {
          toast({ title: "Bem-vindo!", description: "Login realizado com sucesso" });
          navigate(searchParams.get("redirect") || "/");
        }
      } else {
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => { fieldErrors[err.path[0]] = err.message; });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          const info = getAuthErrorToast(error, "signup");
          toast({ title: info.title, description: info.description, variant: "destructive" });
          if (info.action === "switch_to_login") setMode("login");
          return;
        }
        if (data?.session) {
          toast({ title: "Bem-vindo!", description: "Conta criada com sucesso" });
          navigate(searchParams.get("redirect") || "/");
        } else {
          toast({ title: "Conta criada!", description: "Verifique seu email para confirmar a conta." });
          setMode("login");
        }
      }
    } catch {
      toast({ title: "Erro", description: "Algo deu errado. Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-foreground" /></div>;
  }

  return (
    <>
      <SEOHead title={`${mode === "login" ? "Login" : "Cadastro"} - SevenDevX`} description="Acesse sua conta SevenDevX" url="https://www.sevendevx.com/auth" />
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-white/3 rounded-full blur-[120px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao site
          </button>

          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold font-orbitron mb-2">SEVEN<span className="text-muted-foreground">DEVX</span></h1>
              <p className="text-muted-foreground text-sm">{mode === "login" ? "Entre na sua conta" : "Crie sua conta"}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Seu nome"
                      className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30" />
                  </div>
                  {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30" />
                </div>
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-secondary border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30" />
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Entrar" : "Criar conta"}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">{mode === "login" ? "Não tem conta?" : "Já tem conta?"}</span>{" "}
              <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-foreground font-medium hover:underline">
                {mode === "login" ? "Cadastre-se" : "Fazer login"}
              </button>
            </div>
          </GlassCard>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Ao continuar, você concorda com nossos{" "}
            <a href="/privacy-policy" className="underline hover:text-foreground/60">Termos de Uso</a>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;
