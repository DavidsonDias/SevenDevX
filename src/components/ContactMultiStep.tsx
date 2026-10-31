import EditorialAtmosphere from "@/components/EditorialAtmosphere";
import "@/components/contact-experience.css";
import DOMPurify from "dompurify";
import { useContacts } from "@/hooks/useContacts";
import ContactGuide from "@/components/ContactGuide";
/**
 * ContactMultiStep.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/ContactMultiStep.tsx
 * @module UI
 *
 * @description
 * Formulário de contato em etapas, projetado para reduzir atrito e qualificar o lead antes do envio.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ContactMultiStep — Multi-step form with i18n, validation, sanitization
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { usePublicCopy } from "@/i18n/usePublicCopy";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, Send } from "lucide-react";
import contactBackground from "@/assets/images/contact-background.webp";
import { useLanguage } from "@/i18n/LanguageContext";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const ContactMultiStep: React.FC = () => {
  const { copy } = usePublicCopy();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { saveAndOpenWhatsApp, isSubmitting } = useContacts();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", message: "",
    projectType: "", budget: "", hp_email: "",
  });
  const [confirmacaoDados, setConfirmacaoDados] = useState(false);
  const [politicaPrivacidade, setPoliticaPrivacidade] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const totalSteps = 3;
  const formRef = useRef<HTMLFormElement>(null);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(currentStep);
  useEffect(() => {
    if (previousStep.current === currentStep) return;
    previousStep.current = currentStep;
    stepTitle.current?.focus({preventScroll:true});
    stepTitle.current?.scrollIntoView({block:'nearest',behavior:'auto'});
  }, [currentStep]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: boolean } = {};
    if (step === 1) {
      if (!formData.name.trim() || formData.name.length > 100) newErrors.name = true;
      if (formData.phone.replace(/\D/g, "").length < 10 || formData.phone.length > 20) newErrors.phone = true;
      if (!formData.email.trim() || !validateEmail(formData.email) || formData.email.length > 255) newErrors.email = true;
    }
    if (step === 2) {
      if (!formData.projectType) newErrors.projectType = true;
      if (!formData.message.trim() || formData.message.length > 1000) newErrors.message = true;
    }
    if (step === 3) {
      if (!confirmacaoDados) newErrors.confirmacao = true;
      if (!politicaPrivacidade) newErrors.politica = true;
    }
    if (formData.hp_email && formData.hp_email.trim().length > 0) newErrors.hp = true;
    setErrors(newErrors);
    const firstError=Object.keys(newErrors)[0];
    if(firstError) requestAnimationFrame(()=>formRef.current?.querySelector<HTMLElement>(`[id="${firstError}"]`)?.focus());
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast({ title: t.notifications.warning, description: t.forms.fieldRequired, variant: "destructive" });
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) {
      toast({ title: t.contact.errorTitle, description: t.contact.errorMessage, variant: "destructive" });
      return;
    }
    if (formData.hp_email && formData.hp_email.trim().length > 0) return;

    const s = (v: string) => DOMPurify.sanitize(v.trim(), { ALLOWED_TAGS: [] });
    const sanitized = {
      name: s(formData.name), phone: s(formData.phone), email: s(formData.email),
      message: s(formData.message), projectType: s(formData.projectType || "N/A"),
      budget: s(formData.budget || "N/A"),
    };

    const whatsappMessage = `🚀 *Novo Contato - SevenDevX*\n\n*${t.contact.nameLabel}:* ${sanitized.name}\n*${t.contact.phoneLabel}:* ${sanitized.phone}\n*${t.contact.emailLabel}:* ${sanitized.email}\n\n*${t.contact.projectTypeLabel}:* ${sanitized.projectType}\n*${t.contact.budgetLabel}:* ${sanitized.budget}\n\n*${t.contact.messageLabel}:*\n${sanitized.message}\n\n✅ ${t.contact.confirmData}\n✅ ${t.contact.acceptPrivacy} ${t.contact.privacyPolicy}`;

    await saveAndOpenWhatsApp({
      name: sanitized.name, email: sanitized.email, phone: sanitized.phone,
      message: sanitized.message, service_type: sanitized.projectType,
      budget: sanitized.budget, source: "multi_step_form",
    }, whatsappMessage);

    setFormData({ name: "", phone: "", email: "", message: "", projectType: "", budget: "", hp_email: "" });
    setConfirmacaoDados(false);
    setPoliticaPrivacidade(false);
    setErrors({});
    setCurrentStep(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if ((errors as any)[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) return numbers.replace(/(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
  };

  const stepLabels = [t.contact.step1, t.contact.step2, t.contact.step3];

  return (
    <section id="contact" className="contact-experience relative min-h-screen flex items-center py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden bg-background">
      <EditorialAtmosphere target=".contact-experience" version={String(currentStep)} />
      {/* Background */}
      <div className="contact-background absolute inset-0 z-0">
        <img src={contactBackground} alt="" aria-hidden="true" loading="lazy" className="w-full h-full object-cover" />
        <div className="contact-photo-shade absolute inset-0" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="contact-preview-layout"><ContactGuide step={currentStep}/><div className="contact-form-column">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-10 md:mb-12 text-center"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 uppercase tracking-tight leading-tight">
              {t.contact.sectionTitle}
            </h2>
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
              {t.contact.stepsSubtitle.replace("{step}", "3")}
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm sm:text-base ${
                    currentStep >= step ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border"
                  }`}>
                    {currentStep > step ? <Check size={16} className="sm:w-5 sm:h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-0.5 mx-1 xs:mx-2 transition-all duration-300 ${currentStep > step ? "bg-foreground" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider px-1">
              {stepLabels.map((label, i) => (
                <span key={i} className={i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right"}>{copy(label)}</span>
              ))}
            </div>
          </div>

          {/* Form */}
          <motion.form
            ref={formRef}
            noValidate
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6 bg-card/40 backdrop-blur-sm border border-border p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12"
          >
            <div className="contact-step-heading"><span>{String(currentStep).padStart(2,'0')} / 03</span><h3 ref={stepTitle} tabIndex={-1}>{stepLabels[currentStep-1]}</h3></div>
            <p className="contact-required">{{pt:'Campos obrigatórios, exceto o orçamento.',en:'All fields required except budget.',es:'Campos obligatorios, excepto el presupuesto.'}[language]}</p>
            {Object.values(errors).some(Boolean) && <p className="contact-error-summary" role="alert">{{pt:'Revise os campos indicados para continuar.',en:'Review the highlighted fields to continue.',es:'Revisa los campos indicados para continuar.'}[language]}</p>}
            {/* Honeypot */}
            <div className="sr-only" aria-hidden>
              <label htmlFor="hp_email">{copy("Leave empty")}</label>
              <input id="hp_email" name="hp_email" value={formData.hp_email} onChange={handleChange} autoComplete="off" tabIndex={-1} className="opacity-0 pointer-events-none" />
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-[10px] xs:text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">{t.contact.nameLabel}</label>
                    <Input id="name" name="name" autoComplete="name" aria-describedby={errors.name ? "contact-name-error" : undefined} value={formData.name} onChange={handleChange} placeholder={t.contact.namePlaceholder} aria-invalid={!!errors.name} maxLength={100}
                      className={`bg-background/40 border ${errors.name ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground h-12 sm:h-14 text-xs sm:text-sm focus:border-foreground transition-all`} />
                    {errors.name && <p id="contact-name-error" className="text-destructive text-xs mt-1 uppercase tracking-wide">{t.forms.fieldRequired}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[10px] xs:text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">{t.contact.phoneLabel}</label>
                    <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" aria-describedby={errors.phone ? "contact-phone-error" : undefined} value={formData.phone} onChange={handlePhoneChange} placeholder={t.contact.phonePlaceholder} aria-invalid={!!errors.phone} maxLength={20}
                      className={`bg-background/40 border ${errors.phone ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground h-12 sm:h-14 text-xs sm:text-sm focus:border-foreground transition-all`} />
                    {errors.phone && <p id="contact-phone-error" className="text-destructive text-xs mt-1 uppercase tracking-wide">{t.forms.invalidPhone}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[10px] xs:text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">{t.contact.emailLabel}</label>
                    <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" aria-describedby={errors.email ? "contact-email-error" : undefined} value={formData.email} onChange={handleChange} placeholder={t.contact.emailPlaceholder} aria-invalid={!!errors.email} maxLength={255}
                      className={`bg-background/40 border ${errors.email ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground h-12 sm:h-14 text-xs sm:text-sm focus:border-foreground transition-all`} />
                    {errors.email && <p id="contact-email-error" className="text-destructive text-xs mt-1 uppercase tracking-wide">{t.forms.invalidEmail}</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                  <div>
                    <label htmlFor="projectType" className="block text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">{t.contact.projectTypeLabel}</label>
                    <select id="projectType" name="projectType" aria-describedby={errors.projectType ? "contact-projectType-error" : undefined} value={formData.projectType} onChange={handleChange} aria-invalid={!!errors.projectType}
                      className={`w-full bg-background/40 border ${errors.projectType ? "border-destructive" : "border-border"} text-foreground h-12 sm:h-14 px-3 text-sm focus:border-foreground transition-all`}>
                      <option value="" className="bg-background">{t.contact.projectTypePlaceholder}</option>
                      {t.contact.projectTypes.map((type) => (
                        <option key={type} value={type} className="bg-background">{type}</option>
                      ))}
                    </select>
                    {errors.projectType && <p id="contact-projectType-error" className="text-destructive text-xs mt-1 uppercase tracking-wide">{t.forms.selectOption}</p>}
                  </div>
                  <div>
                    <label htmlFor="budget" className="block text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">{t.contact.budgetLabel}</label>
                    <select id="budget" name="budget" value={formData.budget} onChange={handleChange}
                      className="w-full bg-background/40 border border-border text-foreground h-12 sm:h-14 px-3 text-sm focus:border-foreground transition-all">
                      <option value="" className="bg-background">{t.contact.budgetPlaceholder}</option>
                      {t.contact.budgetRanges.map((range) => (
                        <option key={range} value={range} className="bg-background">{range}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">{t.contact.messageLabel}</label>
                    <Textarea id="message" name="message" maxLength={1000} aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"} value={formData.message} onChange={handleChange} placeholder={t.contact.messagePlaceholder} rows={6} aria-invalid={!!errors.message}
                      className={`bg-background/40 border ${errors.message ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground text-sm focus:border-foreground resize-none transition-all`} />
                    <p id="contact-message-hint" className="contact-message-hint">{{pt:'Conte o objetivo, o público e o que você precisa. Não inclua senhas ou dados sensíveis.',en:'Describe your goal, audience and needs. Do not include passwords or sensitive data.',es:'Describe tu objetivo, público y necesidades. No incluyas contraseñas ni datos sensibles.'}[language]} <span>{formData.message.length}/1000</span></p>
                    {errors.message && <p id="contact-message-error" className="text-destructive text-xs mt-1 uppercase tracking-wide">{t.forms.fieldRequired}</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                  <div className="bg-foreground/5 p-6 space-y-3 border border-border">
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t.contact.step3}</h3>
                    <p className="text-xs text-muted-foreground"><span className="text-foreground/90 font-semibold">{t.contact.nameLabel}:</span> {formData.name}</p>
                    <p className="text-xs text-muted-foreground"><span className="text-foreground/90 font-semibold">{t.contact.phoneLabel}:</span> {formData.phone}</p>
                    <p className="text-xs text-muted-foreground"><span className="text-foreground/90 font-semibold">{t.contact.emailLabel}:</span> {formData.email}</p>
                    <p className="text-xs text-muted-foreground"><span className="text-foreground/90 font-semibold">{t.contact.projectTypeLabel}:</span> {copy(formData.projectType || "—")}</p>
                    <p className="contact-review-message"><span>{t.contact.messageLabel}:</span>{formData.message}</p>
                    <div className="contact-review-actions"><button type="button" onClick={()=>setCurrentStep(1)}>{{pt:'Editar contato',en:'Edit contact',es:'Editar contacto'}[language]}</button><button type="button" onClick={()=>setCurrentStep(2)}>{{pt:'Editar projeto',en:'Edit project',es:'Editar proyecto'}[language]}</button></div>
                    {formData.budget && <p className="text-xs text-muted-foreground"><span className="text-foreground/90 font-semibold">{t.contact.budgetLabel}:</span> {formData.budget}</p>}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox id="confirmacao" checked={confirmacaoDados}
                        onCheckedChange={(checked) => { setConfirmacaoDados(checked as boolean); if (errors.confirmacao) setErrors((prev) => ({ ...prev, confirmacao: false })); }}
                        className={`mt-1 ${errors.confirmacao ? "border-destructive" : "border-muted-foreground"}`} />
                      <label htmlFor="confirmacao" className="text-xs text-muted-foreground leading-relaxed uppercase tracking-wide">{t.contact.confirmData}</label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox id="politica" checked={politicaPrivacidade}
                        onCheckedChange={(checked) => { setPoliticaPrivacidade(checked as boolean); if (errors.politica) setErrors((prev) => ({ ...prev, politica: false })); }}
                        className={`mt-1 ${errors.politica ? "border-destructive" : "border-muted-foreground"}`} />
                      <label htmlFor="politica" className="text-xs text-muted-foreground leading-relaxed uppercase tracking-wide">
                        {t.contact.acceptPrivacy}{copy(" ")}
                        <Link to="/privacy-policy" className="text-foreground hover:text-foreground/80 underline">{t.contact.privacyPolicy}</Link>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 sm:gap-4 pt-4">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-border px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-foreground/10 transition-all duration-300 min-w-[100px] sm:min-w-[120px]">
                  <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  <span>{t.contact.back}</span>
                </button>
              )}
              {currentStep < totalSteps ? (
                <button type="button" onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-foreground text-background px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-foreground/90 transition-all duration-300">
                  <span>{t.contact.next}</span>
                  <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3 sm:py-4 px-5 sm:px-8 text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50">
                  <Send size={16} />
                  <span>{isSubmitting ? ({pt:"Enviando…",en:"Sending…",es:"Enviando…"}[language]) : t.contact.submit}</span>
                </button>
              )}
            </div>
          </motion.form>

        </div></div>
      </div>
    </section>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default ContactMultiStep;
