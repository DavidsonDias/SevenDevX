/**
 * AiProjectGeneratorModal.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/AiProjectGeneratorModal.tsx
 * @module SevenOS/UI
 *
 * @description
 * Geração assistida de projeto a partir de um briefing.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🪄 AiProjectGeneratorModal — gera projeto completo (cliente + projeto + estágios + documentos + estimativa)
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useScrollLock } from "@/hooks/useScrollLock";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerated?: (projectId: string) => void;
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Modal que gera rascunho de projeto (escopo, stack e etapas) via IA.
 */
export default function AiProjectGeneratorModal({ open, onClose, onGenerated }: Props) {
  useScrollLock(open);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [briefing, setBriefing] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const reset = () => {
    setBriefing(""); setClientName(""); setClientEmail(""); setClientCompany(""); setResult(null);
  };

  const submit = async () => {
    if (briefing.trim().length < 20) {
      toast({ title: "Briefing muito curto", description: "Descreva o projeto com pelo menos 20 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("project-generator", {
        body: {
          briefing: briefing.trim(),
          client_name: clientName.trim() || null,
          client_email: clientEmail.trim() || null,
          client_company: clientCompany.trim() || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Projeto gerado!", description: `${data.stages_created} estágios e ${data.documents_created} documentos criados.` });
      onGenerated?.(data.project_id);
    } catch (e: any) {
      toast({ title: "Falha ao gerar projeto", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const goToProject = () => {
    if (result?.project_id) {
      onClose();
      reset();
      navigate(`/admin/projects/${result.project_id}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => !loading && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl my-8 bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Gerar Projeto Completo com IA
              </h3>
              <button onClick={onClose} disabled={loading} className="p-1 rounded hover:bg-white/10 disabled:opacity-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!result ? (
                <>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-white/50 mb-1.5 block">Briefing do projeto *</label>
                    <textarea
                      value={briefing}
                      onChange={(e) => setBriefing(e.target.value)}
                      placeholder="Ex: Preciso de uma landing page para um curso online de marketing digital, com integração com Stripe, captura de leads via WhatsApp, blog para SEO e área de membros..."
                      rows={6}
                      maxLength={2000}
                      disabled={loading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-white/30 disabled:opacity-50"
                    />
                    <p className="text-[11px] text-white/40 mt-1">{briefing.length}/2000</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-1.5 block">Nome do cliente</label>
                      <input value={clientName} onChange={(e) => setClientName(e.target.value)} disabled={loading} maxLength={120}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-1.5 block">Email</label>
                      <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} disabled={loading} type="email" maxLength={200}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-1.5 block">Empresa</label>
                      <input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} disabled={loading} maxLength={120}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50" />
                    </div>
                  </div>

                  <button
                    onClick={submit}
                    disabled={loading || briefing.trim().length < 20}
                    className="w-full py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 inline-flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando projeto, cliente, estágios e documentos...</> : <><Sparkles className="w-4 h-4" /> Gerar com IA</>}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-5 h-5" /> Projeto criado com sucesso!</div>
                  <div className="text-sm space-y-1.5 bg-white/5 rounded-lg p-4 border border-white/10">
                    <div><span className="text-white/50">Título:</span> <strong>{result.estimate?.title}</strong></div>
                    <div><span className="text-white/50">Prazo estimado:</span> {result.estimate?.estimated_weeks} semanas</div>
                    <div><span className="text-white/50">Valor:</span> R$ {result.estimate?.estimated_value_brl?.toLocaleString("pt-BR")} em {result.estimate?.installments}x</div>
                    <div><span className="text-white/50">Estágios criados:</span> {result.stages_created}</div>
                    <div><span className="text-white/50">Documentos:</span> {result.documents_created} (escopo + proposta)</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={goToProject} className="flex-1 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90">Abrir projeto</button>
                    <button onClick={() => { reset(); }} className="px-4 py-2.5 border border-white/15 rounded-lg text-sm hover:bg-white/5">Gerar outro</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
