/**
 * DiagnosticoModal.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/DiagnosticoModal.tsx
 * @module UI
 *
 * @description
 * Fluxo de diagnóstico gratuito usado pelos CTAs; grava o lead e as respostas antes de encaminhar ao WhatsApp.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🩺 DiagnosticoModal — formulário multi-step para diagnóstico gratuito.
 * Reutilizado no Hero e no CTA final. Cria contact + registro em site_page_diagnostics.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useScrollLock } from "@/hooks/useScrollLock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

type Props = {
  open: boolean;
  onClose: () => void;
  config?: {
    title?: string;
    description?: string;
    consent_text?: string;
    redirect_url?: string;
  };
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  segment: string;
  project_type: string;
  current_site: string;
  goals: string;
  budget: string;
  deadline: string;
  notes: string;
  consent: boolean;
};

const STEPS = [
  { id: "contact", title: "Contato", fields: ["name", "email", "phone"] },
  { id: "business", title: "Negócio", fields: ["company", "segment"] },
  { id: "project", title: "Projeto", fields: ["project_type", "current_site"] },
  { id: "goals", title: "Objetivos", fields: ["goals"] },
  { id: "budget", title: "Orçamento", fields: ["budget", "deadline"] },
  { id: "extra", title: "Detalhes", fields: ["notes", "consent"] },
] as const;

const PROJECT_TYPES = ["Landing page", "Site institucional", "E-commerce", "Sistema/SaaS", "Portal", "Outro"];
const BUDGETS = ["Até R$ 5k", "R$ 5-15k", "R$ 15-40k", "R$ 40k+", "Não sei ainda"];
const DEADLINES = ["Urgente (até 15 dias)", "Rápido (15-30 dias)", "Normal (1-2 meses)", "Flexível (3+ meses)"];

/**
 * Modal do diagnóstico gratuito: coleta as respostas do visitante em etapas e
 * registra o lead resultante no backend.
 *
 * @param open - Controla a visibilidade do modal.
 * @param onOpenChange - Notifica abertura/fechamento para o componente pai.
 */
export default function DiagnosticoModal({ open, onClose, config }: Props) {
  const { toast } = useToast();
  useScrollLock(open);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", company: "", segment: "",
    project_type: "", current_site: "", goals: "", budget: "", deadline: "",
    notes: "", consent: false,
  });

  useEffect(() => {
    if (!open) {
      setStep(0); setDone(false); setSubmitting(false);
      setForm({ name: "", email: "", phone: "", company: "", segment: "", project_type: "", current_site: "", goals: "", budget: "", deadline: "", notes: "", consent: false });
    }
  }, [open]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));

  const currentStep = STEPS[step];
  const isValid = () => {
    if (currentStep.id === "contact") return form.name.trim().length > 1 && /.+@.+\..+/.test(form.email);
    if (currentStep.id === "extra") return form.consent;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      // 1. Cria/atualiza contact (evita duplicidade por email)
      const { data: existing } = await sb.rpc("contact_id_by_email" as any, { _email: form.email });
      let contactId: string | undefined = typeof existing === "string" ? existing : (existing as any) ?? undefined;
      if (!contactId) {
        const { data: created, error: cErr } = await sb.from("contacts").insert({
          name: form.name, email: form.email, phone: form.phone || null,
          company: form.company || null,
          message: form.notes || null,
          service_type: form.project_type || null,
          budget: form.budget || null,
          source: "diagnostico-criacao-sites",
          status: "new",
        }).select("id").single();
        if (cErr) throw cErr;
        contactId = created.id;
      }

      // 2. Captura UTM da URL
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(k => {
        const v = params.get(k); if (v) utm[k] = v;
      });

      // 3. Grava diagnóstico
      await sb.from("site_page_diagnostics").insert({
        contact_id: contactId,
        answers: form,
        source_url: window.location.href,
        utm,
        consent_lgpd: form.consent,
        consent_at: form.consent ? new Date().toISOString() : null,
      });

      setDone(true);
      toast({ title: "✅ Diagnóstico enviado!", description: "Retornamos em até 24h." });

      if (config?.redirect_url) {
        setTimeout(() => { window.location.href = config.redirect_url!; }, 1500);
      }
    } catch (e: any) {
      console.error("[diagnostico] submit error", e);
      toast({ title: "Erro ao enviar", description: e.message ?? "Tente novamente", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else submit();
  };
  const prev = () => step > 0 && setStep(s => s - 1);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>

          {done ? (
            <div className="p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="inline-flex w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Recebido!</h3>
              <p className="text-muted-foreground mb-6">Retornamos em até 24 horas com um plano claro para o seu projeto.</p>
              <button onClick={onClose} className="px-6 py-3 rounded-xl border border-border hover:bg-white/5 transition text-sm uppercase tracking-wider font-semibold">Fechar</button>
            </div>
          ) : (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Passo {step + 1} de {STEPS.length}</p>
                <h3 className="text-2xl font-bold">{config?.title || "Diagnóstico gratuito"}</h3>
                <p className="text-sm text-muted-foreground mt-1">{config?.description || "Preencha em 2 minutos e retornamos em até 24h."}</p>
                {/* Progress */}
                <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>

              <div className="p-6 min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-semibold mb-4">{currentStep.title}</h4>

                    {currentStep.id === "contact" && (
                      <>
                        <Field label="Nome *" value={form.name} onChange={v => set("name", v)} placeholder="Seu nome completo" />
                        <Field label="E-mail *" value={form.email} onChange={v => set("email", v)} placeholder="voce@empresa.com" type="email" />
                        <Field label="WhatsApp" value={form.phone} onChange={v => set("phone", v)} placeholder="(31) 98474-0625" />
                      </>
                    )}
                    {currentStep.id === "business" && (
                      <>
                        <Field label="Empresa" value={form.company} onChange={v => set("company", v)} placeholder="Nome da empresa" />
                        <Field label="Segmento" value={form.segment} onChange={v => set("segment", v)} placeholder="Ex: Saúde, Educação, E-commerce" />
                      </>
                    )}
                    {currentStep.id === "project" && (
                      <>
                        <Select label="Tipo de projeto" value={form.project_type} onChange={v => set("project_type", v)} options={PROJECT_TYPES} />
                        <Field label="Site atual (se houver)" value={form.current_site} onChange={v => set("current_site", v)} placeholder="https://..." />
                      </>
                    )}
                    {currentStep.id === "goals" && (
                      <TextArea label="Qual objetivo principal do site?" value={form.goals} onChange={v => set("goals", v)} placeholder="Ex: gerar leads B2B, vender online, autoridade de marca..." />
                    )}
                    {currentStep.id === "budget" && (
                      <>
                        <Select label="Orçamento" value={form.budget} onChange={v => set("budget", v)} options={BUDGETS} />
                        <Select label="Prazo desejado" value={form.deadline} onChange={v => set("deadline", v)} options={DEADLINES} />
                      </>
                    )}
                    {currentStep.id === "extra" && (
                      <>
                        <TextArea label="Algo mais que devemos saber?" value={form.notes} onChange={v => set("notes", v)} placeholder="Referências, requisitos especiais, integrações..." />
                        <label className="flex items-start gap-3 p-4 rounded-lg border border-border bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition">
                          <input type="checkbox" checked={form.consent} onChange={e => set("consent", e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
                          <span className="text-sm text-muted-foreground">
                            <ShieldCheck className="w-4 h-4 inline mr-1 text-primary" />
                            {config?.consent_text || "Autorizo o contato conforme a LGPD e concordo com os termos de privacidade."}
                          </span>
                        </label>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 bg-white/[0.02]">
                <button
                  onClick={prev} disabled={step === 0 || submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  onClick={next} disabled={!isValid() || submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando</>
                    : step === STEPS.length - 1 ? <>Enviar diagnóstico <CheckCircle2 className="w-4 h-4" /></>
                    : <>Próximo <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-border focus:border-primary focus:outline-none transition text-sm" />
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-border focus:border-primary focus:outline-none transition text-sm resize-none" />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map(o => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`px-3 py-2 rounded-lg border text-sm transition ${value === o ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-white/5 text-muted-foreground"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
