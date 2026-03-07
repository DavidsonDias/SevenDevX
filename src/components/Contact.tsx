import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { useLanguage } from "@/i18n/LanguageContext";
import { useContacts } from "@/hooks/useContacts";

/**
 * 💬 Contact — Versão PRO++ SevenDevX (i18n)
 * Inclui:
 * ✅ Sanitização (DOMPurify)
 * ✅ Validação de comprimento
 * ✅ Proteção anti-spam (honeypot)
 * ✅ UX e feedback visual refinado
 * ✅ Acessibilidade e semântica melhoradas
 * ✅ i18n completo (PT/EN/ES)
 */

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { saveAndOpenWhatsApp, isSubmitting } = useContacts();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    honeypot: "", // campo oculto para anti-spam
  });

  const [confirmacaoDados, setConfirmacaoDados] = useState(false);
  const [politicaPrivacidade, setPoliticaPrivacidade] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // 🔍 Validação de e-mail
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 📤 Envio de formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🧱 Proteção anti-spam (bots preenchem campos ocultos)
    if (formData.honeypot) return;

    const newErrors: { [key: string]: boolean } = {};

    // ⚙️ Validação
    if (!formData.name.trim() || formData.name.length > 100) newErrors.name = true;
    if (!formData.phone.trim() || formData.phone.length > 20) newErrors.phone = true;
    if (!formData.email.trim() || !validateEmail(formData.email) || formData.email.length > 255)
      newErrors.email = true;
    if (!formData.message.trim() || formData.message.length > 1000)
      newErrors.message = true;
    if (!confirmacaoDados) newErrors.confirmacao = true;
    if (!politicaPrivacidade) newErrors.politica = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: t.contact.errorTitle,
        description: t.contact.errorMessage,
        variant: "destructive",
      });
      return;
    }

    // 🧹 Sanitização de dados (remove HTML/script)
    const sanitizedData = {
      name: DOMPurify.sanitize(formData.name.trim(), { ALLOWED_TAGS: [] }),
      phone: DOMPurify.sanitize(formData.phone.trim(), { ALLOWED_TAGS: [] }),
      email: DOMPurify.sanitize(formData.email.trim(), { ALLOWED_TAGS: [] }),
      message: DOMPurify.sanitize(formData.message.trim(), { ALLOWED_TAGS: [] }),
    };

    // 💬 Montagem da mensagem
    const whatsappMessage = `Olá! Estou enviando os dados solicitados sobre o meu projeto.

*Nome:* ${sanitizedData.name}
*Telefone/WhatsApp:* ${sanitizedData.phone}
*E-mail:* ${sanitizedData.email}
*Mensagem:* ${sanitizedData.message}

✅ Confirmo que as informações são verdadeiras.
✅ Aceito a Política de Privacidade.

🚀 *SevenDevX - Contato pelo site* 🚀`;

    // 💾 Salva no banco E abre WhatsApp
    await saveAndOpenWhatsApp(
      {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        message: sanitizedData.message,
        source: "contact_form",
      },
      whatsappMessage
    );

    // 🔄 Reset form
    setFormData({ name: "", phone: "", email: "", message: "", honeypot: "" });
    setConfirmacaoDados(false);
    setPoliticaPrivacidade(false);
    setErrors({});
  };

  // 🧠 Atualização de campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  // ☎️ Formatação do telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.length <= 10
      ? numbers.replace(/(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3")
      : numbers.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen flex items-center bg-black py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Título e subtítulo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 uppercase tracking-tight leading-tight">
              {t.contact.sectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
              {t.contact.sectionSubtitle}
            </p>
          </motion.div>

          {/* Formulário */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 bg-zinc-950/40 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-lg shadow-lg"
          >
            {/* Campo honeypot oculto */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold"
              >
                {t.contact.nameLabel}
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t.contact.namePlaceholder}
                className={`bg-black/40 border ${
                  errors.name ? "border-red-500" : "border-white/20"
                } text-white placeholder:text-white/40 h-14 text-sm focus:border-white`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 uppercase tracking-wide">
                  {t.contact.namePlaceholder}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold"
              >
                {t.contact.phoneLabel}
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder={t.contact.phonePlaceholder}
                className={`bg-black/40 border ${
                  errors.phone ? "border-red-500" : "border-white/20"
                } text-white placeholder:text-white/40 h-14 text-sm focus:border-white`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 uppercase tracking-wide">
                  {t.contact.phonePlaceholder}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold"
              >
                {t.contact.emailLabel}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.contact.emailPlaceholder}
                className={`bg-black/40 border ${
                  errors.email ? "border-red-500" : "border-white/20"
                } text-white placeholder:text-white/40 h-14 text-sm focus:border-white`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 uppercase tracking-wide">
                  {t.contact.emailPlaceholder}
                </p>
              )}
            </div>

            {/* Mensagem */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs text-white/80 mb-2 uppercase tracking-widest font-semibold"
              >
                {t.contact.messageLabel}
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t.contact.messagePlaceholder}
                rows={6}
                className={`bg-black/40 border ${
                  errors.message ? "border-red-500" : "border-white/20"
                } text-white placeholder:text-white/40 text-sm focus:border-white resize-none`}
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1 uppercase tracking-wide">
                  {t.contact.messagePlaceholder}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirmacao"
                  checked={confirmacaoDados}
                  onCheckedChange={(checked) => {
                    setConfirmacaoDados(checked as boolean);
                    if (errors.confirmacao)
                      setErrors((prev) => ({ ...prev, confirmacao: false }));
                  }}
                  className={`mt-1 ${
                    errors.confirmacao ? "border-red-500" : "border-white/40"
                  }`}
                />
                <label
                  htmlFor="confirmacao"
                  className="text-xs text-white/70 leading-relaxed uppercase tracking-wide"
                >
                  {t.contact.confirmData}
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="politica"
                  checked={politicaPrivacidade}
                  onCheckedChange={(checked) => {
                    setPoliticaPrivacidade(checked as boolean);
                    if (errors.politica)
                      setErrors((prev) => ({ ...prev, politica: false }));
                  }}
                  className={`mt-1 ${
                    errors.politica ? "border-red-500" : "border-white/40"
                  }`}
                />
                <label
                  htmlFor="politica"
                  className="text-xs text-white/70 leading-relaxed uppercase tracking-wide"
                >
                  {t.contact.acceptPrivacy}{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {t.contact.privacyPolicy}
                  </Link>
                  .
                </label>
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground font-bold py-4 px-8 text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : t.contact.submit}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;