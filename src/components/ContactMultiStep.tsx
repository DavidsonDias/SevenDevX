// 📂 src/components/ContactMultiStep.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import contactBackground from "@/assets/images/contact-background.webp";
import DOMPurify from "dompurify";
import { useContacts } from "@/hooks/useContacts";

/**
 * 💬 ContactMultiStep.tsx — SevenDevX v1.0 PRO++
 * -------------------------------------------------------------
 * ✅ Multi-step form com validação, sanitização e honeypot anti-bot
 * ✅ Mobile-first, responsivo e acessível
 * ✅ Envia dados para WhatsApp (wa.me) após sanitização
 * ✅ WhatsApp: +55 31 98474-0625 (wa.me: 5531984740625)
 * -------------------------------------------------------------
 * Observações:
 * - Customize textos e paths de assets conforme necessário
 * -------------------------------------------------------------
 */


const ContactMultiStep: React.FC = () => {
  const { toast } = useToast();
  const { saveAndOpenWhatsApp, isSubmitting } = useContacts();

  // Estado do step atual (1..totalSteps)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    projectType: "",
    budget: "",
    // honeypot field (deve ficar vazio para humanos)
    hp_email: "",
  });

  // Confirmação e política
  const [confirmacaoDados, setConfirmacaoDados] = useState(false);
  const [politicaPrivacidade, setPoliticaPrivacidade] = useState(false);

  // Erros por campo
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const totalSteps = 3;

  // Tipos e orçamentos disponíveis (pode vir de props / CMS)
  const projectTypes = [
    "Landing Page",
    "Site Institucional",
    "E-commerce",
    "Sistema Web",
    "Aplicativo Mobile",
    "Manutenção",
    "Outro",
  ];

  const budgetRanges = [
    "Até R$ 2.000",
    "R$ 2.000 - R$ 5.000",
    "R$ 5.000 - R$ 10.000",
    "Acima de R$ 10.000",
    "Prefiro não informar",
  ];

  // Regex simples p/ validar e-mail
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validação por etapa — retorna true se ok
  const validateStep = (step: number) => {
    const newErrors: { [key: string]: boolean } = {};

    // Step 1 — dados pessoais
    if (step === 1) {
      if (!formData.name.trim() || formData.name.length > 100) newErrors.name = true;
      if (!formData.phone.trim() || formData.phone.length > 20) newErrors.phone = true;
      if (!formData.email.trim() || !validateEmail(formData.email) || formData.email.length > 255) newErrors.email = true;
    }

    // Step 2 — detalhes do projeto
    if (step === 2) {
      if (!formData.projectType) newErrors.projectType = true;
      if (!formData.message.trim() || formData.message.length > 1000) newErrors.message = true;
    }

    // Step 3 — confirmação e política
    if (step === 3) {
      if (!confirmacaoDados) newErrors.confirmacao = true;
      if (!politicaPrivacidade) newErrors.politica = true;
    }

    // Honeypot check (deve estar vazio)
    if (formData.hp_email && formData.hp_email.trim().length > 0) {
      // marca um erro genérico que impede envio
      newErrors.hp = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Próximo step (só avança se valida)
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Atenção",
        description: "Preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive",
      });
    }
  };

  // Voltar step
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Form submit final — sanitiza e redireciona para WhatsApp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // valida o último step (confirmação)
    if (!validateStep(3)) {
      toast({
        title: "Erro",
        description: "Por favor aceite os termos para prosseguir.",
        variant: "destructive",
      });
      return;
    }

    // Segurança: honeypot check (se preenchido, aborta silenciosamente)
    if (formData.hp_email && formData.hp_email.trim().length > 0) {
      console.warn("Honeypot triggered — possível bot detectado");
      return;
    }

    // Sanitização com DOMPurify — remove qualquer tag ou script
    const sanitizedName = DOMPurify.sanitize(formData.name.trim(), { ALLOWED_TAGS: [] });
    const sanitizedPhone = DOMPurify.sanitize(formData.phone.trim(), { ALLOWED_TAGS: [] });
    const sanitizedEmail = DOMPurify.sanitize(formData.email.trim(), { ALLOWED_TAGS: [] });
    const sanitizedMessage = DOMPurify.sanitize(formData.message.trim(), { ALLOWED_TAGS: [] });
    const sanitizedProjectType = DOMPurify.sanitize(formData.projectType || "Não informado", { ALLOWED_TAGS: [] });
    const sanitizedBudget = DOMPurify.sanitize(formData.budget || "Não informado", { ALLOWED_TAGS: [] });

    // Monta a mensagem para WhatsApp (formatada)
    const whatsappMessage = `🚀 *Novo Contato - SevenDevX*

*Nome:* ${sanitizedName}
*Telefone:* ${sanitizedPhone}
*E-mail:* ${sanitizedEmail}

*Tipo de Projeto:* ${sanitizedProjectType}
*Orçamento:* ${sanitizedBudget}

*Mensagem:*
${sanitizedMessage}

✅ Dados confirmados
✅ Política aceita`;

    // 💾 Salva no banco E abre WhatsApp
    await saveAndOpenWhatsApp(
      {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        service_type: sanitizedProjectType,
        budget: sanitizedBudget,
        source: "multi_step_form",
      },
      whatsappMessage
    );

    // Reset de estado
    setFormData({
      name: "",
      phone: "",
      email: "",
      message: "",
      projectType: "",
      budget: "",
      hp_email: "",
    });
    setConfirmacaoDados(false);
    setPoliticaPrivacidade(false);
    setErrors({});
    setCurrentStep(1);
  };

  // Handle change genérico
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // limpa erro do campo conforme digita
    if ((errors as any)[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // Formatação de telefone (aplica máscara visual)
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    }
  };

  // Handler específico para telefone (mantém máscara)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
  };

  return (
    <section id="contact" className="relative min-h-screen flex items-center py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden bg-black">
      {/* Background (imagem com overlay) */}
      <div className="absolute inset-0 z-0">
        <img
          src={contactBackground}
          alt="Fundo da seção de contato — SevenDevX"
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      </div>

      {/* Container principal */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-10 md:mb-12 text-center"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 uppercase tracking-tight leading-tight">
              Entre em Contato
            </h2>
            <p className="text-xs xs:text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
              Vamos conversar sobre seu projeto em {currentStep} etapas simples
            </p>
          </motion.div>

          {/* Barra de progresso */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm sm:text-base ${
                      currentStep >= step ? "bg-white text-black border-white" : "bg-transparent text-white/40 border-white/20"
                    }`}
                    aria-hidden
                  >
                    {currentStep > step ? <Check size={16} className="sm:w-5 sm:h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 xs:mx-2 transition-all duration-300 ${
                        currentStep > step ? "bg-white" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[9px] xs:text-[10px] sm:text-xs text-white/60 uppercase tracking-wider px-1">
              <span className="text-left max-w-[30%]">Dados Pessoais</span>
              <span className="text-center max-w-[30%]">Projeto</span>
              <span className="text-right max-w-[30%]">Confirmação</span>
            </div>
          </div>

          {/* Formulário — multi-step */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6 bg-zinc-950/40 backdrop-blur-sm border border-white/10 p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12"
            aria-labelledby="contact-heading"
          >
            {/* HONEYPOT (campo escondido para bots) */}
            <div className="sr-only" aria-hidden>
              <label htmlFor="hp_email">Leave this field empty</label>
              <input
                id="hp_email"
                name="hp_email"
                value={formData.hp_email}
                onChange={handleChange}
                autoComplete="off"
                tabIndex={-1}
                className="opacity-0 pointer-events-none"
              />
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1 — Dados pessoais */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Nome */}
                  <div>
                    <label htmlFor="name" className="block text-[10px] xs:text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold">
                      Nome Completo
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Digite seu nome completo"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "error-name" : undefined}
                      maxLength={100}
                      className={`bg-black/40 border ${errors.name ? "border-red-500" : "border-white/20"} text-white placeholder:text-white/40 h-12 sm:h-14 text-xs sm:text-sm focus:border-white transition-all`}
                    />
                    {errors.name && (
                      <p id="error-name" className="text-red-500 text-xs mt-1 uppercase tracking-wide">Digite seu nome completo (máx 100 caracteres).</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-[10px] xs:text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold">
                      WhatsApp
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(31) 91234-5678"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "error-phone" : undefined}
                      maxLength={20}
                      className={`bg-black/40 border ${errors.phone ? "border-red-500" : "border-white/20"} text-white placeholder:text-white/40 h-12 sm:h-14 text-xs sm:text-sm focus:border-white transition-all`}
                    />
                    {errors.phone && (
                      <p id="error-phone" className="text-red-500 text-xs mt-1 uppercase tracking-wide">Digite um telefone válido com DDD.</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-[10px] xs:text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold">
                      E-mail
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "error-email" : undefined}
                      maxLength={255}
                      className={`bg-black/40 border ${errors.email ? "border-red-500" : "border-white/20"} text-white placeholder:text-white/40 h-12 sm:h-14 text-xs sm:text-sm focus:border-white transition-all`}
                    />
                    {errors.email && (
                      <p id="error-email" className="text-red-500 text-xs mt-1 uppercase tracking-wide">Digite um e-mail válido.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Detalhes do projeto */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="projectType" className="block text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold">
                      Tipo de Projeto
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      aria-invalid={!!errors.projectType}
                      className={`w-full bg-black/40 border ${errors.projectType ? "border-red-500" : "border-white/20"} text-white h-12 sm:h-14 px-3 text-sm focus:border-white transition-all`}
                    >
                      <option value="" className="bg-black">Selecione o tipo</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type} className="bg-black">{type}</option>
                      ))}
                    </select>
                    {errors.projectType && (
                      <p className="text-red-500 text-xs mt-1 uppercase tracking-wide">Escolha o tipo de projeto.</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold">
                      Orçamento Estimado (Opcional)
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/20 text-white h-12 sm:h-14 px-3 text-sm focus:border-white transition-all"
                    >
                      <option value="" className="bg-black">Selecione uma faixa</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range} className="bg-black">{range}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold">
                      Descreva seu Projeto
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Conte-nos mais sobre sua ideia..."
                      rows={6}
                      aria-invalid={!!errors.message}
                      className={`bg-black/40 border ${errors.message ? "border-red-500" : "border-white/20"} text-white placeholder:text-white/40 text-sm focus:border-white resize-none transition-all`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1 uppercase tracking-wide">Descreva seu projeto (máx 1000 caracteres).</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Confirmação */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Resumo */}
                  <div className="bg-white/5 p-6 rounded space-y-3 border border-white/10">
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resumo do Contato</h3>
                    <p className="text-xs text-white/70"><span className="text-white/90 font-semibold">Nome:</span> {formData.name}</p>
                    <p className="text-xs text-white/70"><span className="text-white/90 font-semibold">WhatsApp:</span> {formData.phone}</p>
                    <p className="text-xs text-white/70"><span className="text-white/90 font-semibold">E-mail:</span> {formData.email}</p>
                    <p className="text-xs text-white/70"><span className="text-white/90 font-semibold">Projeto:</span> {formData.projectType || "—"}</p>
                    {formData.budget && <p className="text-xs text-white/70"><span className="text-white/90 font-semibold">Orçamento:</span> {formData.budget}</p>}
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="confirmacao"
                        checked={confirmacaoDados}
                        onCheckedChange={(checked) => {
                          setConfirmacaoDados(checked as boolean);
                          if (errors.confirmacao) setErrors((prev) => ({ ...prev, confirmacao: false }));
                        }}
                        className={`mt-1 ${errors.confirmacao ? "border-red-500" : "border-white/40"}`}
                      />
                      <label htmlFor="confirmacao" className="text-xs text-white/70 leading-relaxed uppercase tracking-wide">
                        Confirmo que as informações são verdadeiras
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="politica"
                        checked={politicaPrivacidade}
                        onCheckedChange={(checked) => {
                          setPoliticaPrivacidade(checked as boolean);
                          if (errors.politica) setErrors((prev) => ({ ...prev, politica: false }));
                        }}
                        className={`mt-1 ${errors.politica ? "border-red-500" : "border-white/40"}`}
                      />
                      <label htmlFor="politica" className="text-xs text-white/70 leading-relaxed uppercase tracking-wide">
                        Aceito a{" "}
                        <Link to="/privacy-policy" className="text-white hover:text-white/80 underline">
                          Política de Privacidade
                        </Link>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de navegação */}
            <div className="flex gap-3 sm:gap-4 pt-4">
              {/* Voltar */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-white/20 px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-white/10 transition-all duration-300 min-w-[100px] sm:min-w-[120px]"
                >
                  <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  <span className="text-white">Voltar</span>
                </button>
              )}

              {/* Próximo / Enviar */}
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-white text-black px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-white/90 transition-all duration-300"
                >
                  <span className="text-black">Próximo</span>
                  <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-5 sm:px-8 text-xs sm:text-sm tracking-widest uppercase transition-all duration-300"
                >
                  <span className="text-white">Enviar via WhatsApp</span>
                </button>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactMultiStep;