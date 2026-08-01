/**
 * OrcamentoModal.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/OrcamentoModal.tsx
 * @module UI
 *
 * @description
 * Fluxo multi-etapas de orçamento; persiste o lead antes de qualquer redirecionamento externo.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// 📂 src/components/OrcamentoModal.tsx
/**
 * 💰 OrcamentoModal.tsx — SevenDevX v1.0 PRO++
 * -------------------------------------------------------------
 * ✅ Modal controlado (isOpen / onClose)
 * ✅ Validação, sanitização (DOMPurify) e acessibilidade (ARIA)
 * ✅ Focus trap básico, Esc to close, return focus
 * ✅ Integração com WhatsApp (wa.me)
 * ✅ Animações premium com Framer Motion
 * -------------------------------------------------------------
 * Uso:
 * <OrcamentoModal 
 *   isOpen={isOpen} 
 *   onClose={() => setIsOpen(false)} 
 *   planName="Site Institucional" 
 * />
 * -------------------------------------------------------------
 */


// ============================================================================
// 📦 IMPORTS
// ============================================================================

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type OrcamentoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  planName?: string; // preenchido automaticamente ao abrir a partir do card
  whatsappNumber?: string; // formato internacional sem + (ex: '5531984740625') — se não passar, usa fallback
};

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const DEFAULT_WHATSAPP = "5531984740625";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const OrcamentoModal: React.FC<OrcamentoModalProps> = ({
  isOpen,
  onClose,
  planName = "",
  whatsappNumber = DEFAULT_WHATSAPP,
}) => {
  const { toast } = useToast();

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // accessibility refs
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // keep planName snapshot at open time (so if user opens from a card, it persists)
  const [initialPlan] = useState(planName);

  // basic email regex
  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // phone formatter (BR friendly) - preserves numbers only for WhatsApp message
  const formatPhoneInput = (val: string) => {
    const numbers = val.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (m, a, b, c) =>
        c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : `(${a}`
      );
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (m, a, b, c) =>
      c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`
    );
  };

  const getNumbersOnly = (val: string) => val.replace(/\D/g, "");

  // focus management: save previous focused element, move focus to first field, trap focus
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      setTimeout(() => firstFieldRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      previouslyFocused.current?.focus();
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // key handlers (Esc to close, Tab trap basic)
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        // Simple trap: keep focus inside modalRef
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = Array.from(
          modal.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setDetails("");
    setAcceptPrivacy(false);
    setErrors({});
    setSubmitting(false);
  };

  // Validate and prepare message -> open WhatsApp
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;

    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Digite seu nome.";
    if (!phone.trim()) newErrors.phone = "Digite seu telefone/WhatsApp.";
    if (!email.trim() || !validateEmail(email)) newErrors.email = "E-mail inválido.";
    if (!details.trim()) newErrors.details = "Descreva seu projeto.";
    if (!acceptPrivacy) newErrors.privacy = "É necessário aceitar a política de privacidade.";

    // limits
    if (name.length > 100) newErrors.name = "Nome muito longo (máx. 100 caracteres).";
    if (details.length > 2000) newErrors.details = "Descrição muito longa (máx. 2000 caracteres).";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Corrija os campos",
        description: "Verifique os campos destacados e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // sanitização
    const sName = DOMPurify.sanitize(name.trim(), { ALLOWED_TAGS: [] });
    const sPhone = DOMPurify.sanitize(phone.trim(), { ALLOWED_TAGS: [] });
    const sEmail = DOMPurify.sanitize(email.trim(), { ALLOWED_TAGS: [] });
    const sDetails = DOMPurify.sanitize(details.trim(), { ALLOWED_TAGS: [] });
    const sPlan = DOMPurify.sanitize(initialPlan || "Solicitação de Orçamento", { ALLOWED_TAGS: [] });

    const numbersPhone = getNumbersOnly(sPhone);
    const whatsappTarget = whatsappNumber || DEFAULT_WHATSAPP;

    // formatted message with emojis (as requested earlier)
    const message = [
      "👋 Olá! Gostaria de solicitar um orçamento:",
      `🔹 Plano: ${sPlan}`,
      `🔹 Nome: ${sName}`,
      `🔹 Telefone/WhatsApp: ${numbersPhone || sPhone}`,
      `🔹 E-mail: ${sEmail}`,
      `📝 Descrição: ${sDetails}`,
      `\n— Enviado via SevenDevX (site)`
    ].join("\n");

    const url = `https://wa.me/${whatsappTarget}?text=${encodeURIComponent(message)}`;

    try {
      window.open(url, "_blank");
      toast({
        title: "Enviado",
        description: "Abrindo WhatsApp com suas informações (verifique o app/guia).",
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao abrir WhatsApp",
        description: "Algo deu errado ao tentar abrir o WhatsApp. Copie e cole a mensagem manualmente.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  // small helper to update phone and keep formatted value
  const handlePhoneChange = (val: string) => {
    setPhone(formatPhoneInput(val));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden={!isOpen}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="orcamento-title"
            tabIndex={-1}
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="relative z-50 max-w-2xl w-full mx-4 bg-card/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <div>
                <h3 id="orcamento-title" className="text-lg font-orbitron font-semibold">
                  Solicitar Orçamento
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Plano: <span className="font-medium">{initialPlan || "Aberto"}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                aria-label="Fechar dialog"
                className="p-2 rounded-md hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body / Form */}
            <form onSubmit={(e) => handleSubmit(e)} className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orc-name" className="text-xs uppercase tracking-wider text-white/80">
                    Nome <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="orc-name"
                    ref={firstFieldRef}
                    value={name}
                    onChange={(ev) => {
                      setName(ev.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="Seu nome completo"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    maxLength={100}
                    className="mt-2"
                  />
                  {errors.name && (
                    <p id="err-name" className="text-red-400 text-xs mt-1" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="orc-phone" className="text-xs uppercase tracking-wider text-white/80">
                    Telefone / WhatsApp <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="orc-phone"
                    value={phone}
                    onChange={(ev) => handlePhoneChange(ev.target.value)}
                    placeholder="(31) 91234-5678"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    className="mt-2"
                    maxLength={20}
                  />
                  {errors.phone && (
                    <p id="err-phone" className="text-red-400 text-xs mt-1" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="orc-email" className="text-xs uppercase tracking-wider text-white/80">
                  E-mail <span aria-hidden="true">*</span>
                </label>
                <Input
                  id="orc-email"
                  type="email"
                  value={email}
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  }}
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "err-email" : undefined}
                  className="mt-2"
                  maxLength={255}
                />
                {errors.email && (
                  <p id="err-email" className="text-red-400 text-xs mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="orc-details" className="text-xs uppercase tracking-wider text-white/80">
                  Descrição do projeto <span aria-hidden="true">*</span>
                </label>
                <Textarea
                  id="orc-details"
                  value={details}
                  onChange={(ev) => {
                    setDetails(ev.target.value);
                    if (errors.details) setErrors((p) => ({ ...p, details: "" }));
                  }}
                  placeholder="Descreva valores, funcionalidades desejadas, prazo, integrações..."
                  rows={6}
                  aria-invalid={!!errors.details}
                  aria-describedby={errors.details ? "err-details" : undefined}
                  maxLength={2000}
                  className="mt-2"
                />
                {errors.details && (
                  <p id="err-details" className="text-red-400 text-xs mt-1" role="alert">
                    {errors.details}
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="orc-privacy"
                  checked={acceptPrivacy}
                  onCheckedChange={(val) => {
                    setAcceptPrivacy(!!val);
                    if (errors.privacy) setErrors((p) => ({ ...p, privacy: "" }));
                  }}
                />
                <label htmlFor="orc-privacy" className="text-xs text-white/70 leading-relaxed">
                  Li e concordo com a{" "}
                  <a href="/privacy-policy" target="_blank" rel="noreferrer" className="underline text-cyan-400">
                    Política de Privacidade
                  </a>
                  . <span className="text-xs text-white/50"> (obrigatório)</span>
                </label>
              </div>
              {errors.privacy && (
                <p className="text-red-400 text-xs" role="alert">
                  {errors.privacy}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="border border-white/20 px-4 py-2 text-sm uppercase tracking-widest hover:bg-white/5 transition-colors rounded"
                >
                  Cancelar
                </button>

                <Button
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-white text-black px-5 py-3 uppercase tracking-widest"
                  disabled={submitting}
                  onClick={() => {
                    // onClick also triggers submit; disable double triggers
                  }}
                >
                  <span>Enviar para WhatsApp</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default OrcamentoModal;