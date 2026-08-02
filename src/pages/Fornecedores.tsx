/**
 * 🚀 Fornecedores.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/Fornecedores.tsx
 * @module Public
 * @route /fornecedores
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Página de fornecedores e parceiros.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Aplica metadados SEO/GEO da rota
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🧩 ARQUITETURA DO ARQUIVO                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Fornecedores
 *    ├── Header
 *    ├── Footer
 *    ├── WhatsAppButton
 *    └── SEOHead
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
 * ✅ Lucide — iconografia do design system
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ♿ ACESSIBILIDADE                                                    │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Controles interativos expõem rótulos/roles acessíveis
 * ✅ Respeita a preferência de redução de movimento
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/pages/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead from "@/components/SEOHead";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// ---------------------------------------------------------
// 📦 Data (memoizada para performance)
// ---------------------------------------------------------

const areas = [
  "Infraestrutura e Cloud Computing",
  "Serviços de Hospedagem e CDN",
  "Ferramentas de Desenvolvimento",
  "Licenças de Software",
  "Serviços de Design e UI/UX",
  "Marketing Digital e SEO",
  "Hardware e Equipamentos",
  "Consultoria Técnica",
] as const;

const contactItems = [
  {
    icon: Mail,
    title: "E-mail",
    value: "contato@sevendevx.com",
    href: "mailto:contato@sevendevx.com",
    ariaLabel: "Enviar email para SevenDevX",
  },
  {
    icon: Phone,
    title: "Telefone",
    value: "+55 (31) 98474-0625",
    href: "tel:+5531984740625",
    ariaLabel: "Ligar para SevenDevX",
  },
  {
    icon: MapPin,
    title: "Localização",
    value: (
      <>
        Belo Horizonte, MG <br />
        Brasil
      </>
    ),
    href: undefined,
    ariaLabel: "Localização: Belo Horizonte, MG, Brasil",
  },
  {
    icon: Clock,
    title: "Horário",
    value: (
      <>
        Seg - Sex: 9h às 18h <br /> Sáb: 9h às 13h
      </>
    ),
    href: undefined,
    ariaLabel: "Horário de atendimento: Segunda a Sexta 9h às 18h, Sábado 9h às 13h",
  },
] as const;

// ---------------------------------------------------------
// 🎨 Animation Variants (respeitam prefers-reduced-motion)
// ---------------------------------------------------------

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4 }
  },
};

// ---------------------------------------------------------
// 🧩 Main Component
// ---------------------------------------------------------

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const Fornecedores = () => {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  
  const areasList = useMemo(() => t.suppliers.areas, [t]);
  const faqList = useMemo(() => t.suppliers.faq, [t]);
  
  const contactList = useMemo(() => [
    {
      icon: Mail,
      title: t.suppliers.contactItems.email,
      value: "contato@sevendevx.com",
      href: "mailto:contato@sevendevx.com",
      ariaLabel: "Enviar email para SevenDevX",
    },
    {
      icon: Phone,
      title: t.suppliers.contactItems.phone,
      value: "+55 (31) 98474-0625",
      href: "tel:+5531984740625",
      ariaLabel: "Ligar para SevenDevX",
    },
    {
      icon: MapPin,
      title: t.suppliers.contactItems.location,
      value: "Belo Horizonte, MG, Brasil",
      href: undefined,
      ariaLabel: "Localização: Belo Horizonte, MG, Brasil",
    },
    {
      icon: Clock,
      title: t.suppliers.contactItems.hours,
      value: "Seg - Sex: 9h às 18h | Sáb: 9h às 13h",
      href: undefined,
      ariaLabel: "Horário de atendimento",
    },
  ], [t]);

  // Schema.org para SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SevenDevX",
    url: "https://www.sevendevx.com",
    logo: "https://www.sevendevx.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-31-98474-0625",
      contactType: "Supplier Relations",
      areaServed: "BR",
      availableLanguage: "pt-BR",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Belo Horizonte",
      addressRegion: "MG",
      addressCountry: "BR",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.sevendevx.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Fornecedores",
        item: "https://www.sevendevx.com/fornecedores",
      },
    ],
  };

  return (
    <>
      {/* 🎯 SEO avançado com Schema.org */}
      <SEOHead
        title="Portal de Fornecedores - SevenDevX"
        description="Seja um fornecedor parceiro da SevenDevX — inovação, tecnologia e parcerias estratégicas de alta performance."
        keywords="fornecedores, parcerias, tecnologia, infraestrutura, cloud, serviços digitais, SevenDevX"
        url="https://www.sevendevx.com/fornecedores"
        type="website"
      />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="min-h-screen bg-black text-white">
        <Header />

        {/* Skip to content link (A11y) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-white focus:text-black focus:font-bold"
        >
          Pular para o conteúdo principal
        </a>

        <main
          id="main-content"
          className="pt-20"
          role="main"
          aria-labelledby="titulo-fornecedores"
        >
          {/* HERO com gradiente sutil */}
          <section 
            className="min-h-[50vh] flex items-center border-b border-white/10 relative overflow-hidden"
            aria-label="Apresentação do portal de fornecedores"
          >
            {/* Background gradient decorativo */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            <div className="container mx-auto px-6 py-20 relative z-10">
              <motion.div
                initial={prefersReducedMotion ? false : "hidden"}
                animate="visible"
                variants={fadeInUp}
                className="max-w-4xl"
              >
                <h1
                  id="titulo-fornecedores"
                  className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tight leading-tight"
                >
                  {t.suppliers.title}
                </h1>

                <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
                  {t.suppliers.subtitle}
                </p>

                {/* Micro-interaction: stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex gap-8 mt-8 text-sm uppercase tracking-wider text-white/60"
                >
                  <div>
                    <span className="block text-2xl font-bold text-white mb-1">50+</span>
                    {t.suppliers.stats.suppliers}
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-white mb-1">8</span>
                    {t.suppliers.stats.areas}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* APRESENTAÇÃO */}
          <section className="py-20" aria-label="Informações sobre parceria">
            <div className="container mx-auto px-6 max-w-4xl">
              <motion.div
                initial={prefersReducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-tight">
                  {t.suppliers.partnerTitle}
                </h2>

                <div className="space-y-6">
                  {t.suppliers.partnerContent.map((content, i) => (
                    <p key={i} className="text-white/70 leading-relaxed">{content}</p>
                  ))}

                  <div className="flex flex-wrap gap-3 mt-8">
                    {t.suppliers.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-4 py-2 border border-white/20 rounded-full text-sm text-white/60 hover:border-white/40 hover:text-white/80 transition-colors"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* LISTA DE INTERESSE com grid melhorado */}
              <motion.div
                initial={prefersReducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="mb-16"
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-tight">
                  {t.suppliers.areasTitle}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areasList.map((area, i) => (
                    <motion.div
                      key={area}
                      variants={prefersReducedMotion ? undefined : staggerItem}
                      whileHover={prefersReducedMotion ? undefined : { 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      className="group border border-white/20 p-5 rounded-md hover:border-white hover:bg-white/5 transition-all duration-300 cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        {/* Número decorativo */}
                        <span className="text-white/20 font-bold text-sm group-hover:text-white/40 transition-colors">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm uppercase tracking-wider">
                          {area}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CONTATO com melhor hierarquia */}
              <motion.div
                initial={prefersReducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-tight">
                  {t.suppliers.contactTitle}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contactList.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        whileHover={prefersReducedMotion ? undefined : { 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        className="border border-white/20 p-6 rounded-md hover:border-white hover:bg-white/5 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <Icon className="w-6 h-6 text-white/70 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2 uppercase text-sm tracking-wider">
                              {item.title}
                            </h4>

                            {item.href ? (
                              <a
                                href={item.href}
                                aria-label={item.ariaLabel}
                                className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 group"
                              >
                                <span>{item.value}</span>
                                <Send className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ) : (
                              <p className="text-white/70" aria-label={item.ariaLabel}>
                                {item.value}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* CTA FINAL aprimorado */}
              <motion.div
                initial={prefersReducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mt-20 text-center"
              >
                <p className="text-white/70 mb-8 text-lg">
                  {t.suppliers.ctaText}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.a
                    href="mailto:contato@sevendevx.com"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-3 border-2 border-white px-10 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300 group"
                    aria-label={t.suppliers.ctaPrimary}
                  >
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {t.suppliers.ctaPrimary}
                  </motion.a>

                  <motion.a
                    href="https://wa.me/5531984740625?text=Olá! Gostaria de ser fornecedor parceiro da SevenDevX"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-3 border border-white/30 px-10 py-4 text-sm tracking-widest uppercase font-semibold hover:border-white hover:bg-white/5 transition-all duration-300"
                    aria-label={t.suppliers.ctaSecondary}
                  >
                    <Phone className="w-5 h-5" />
                    {t.suppliers.ctaSecondary}
                  </motion.a>
                </div>

                <div className="mt-10 space-y-2">
                  <p className="text-white/40 text-xs tracking-wider">
                    {t.suppliers.disclaimer}
                  </p>
                  <p className="text-white/30 text-xs">
                    {t.suppliers.responseTime}
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Novo: Seção de FAQ rápido */}
          <section 
            className="py-20 border-t border-white/10"
            aria-label="Perguntas frequentes"
          >
            <div className="container mx-auto px-6 max-w-4xl">
              <motion.div
                initial={prefersReducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-tight">
                  {t.suppliers.faqTitle}
                </h3>

                <div className="space-y-6">
                  {faqList.map((faq, i) => (
                    <motion.details
                      key={i}
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group border border-white/20 p-6 rounded-md hover:border-white/40 transition-colors"
                    >
                      <summary className="font-semibold uppercase text-sm tracking-wider cursor-pointer list-none flex items-center justify-between">
                        {faq.q}
                        <span className="text-white/40 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <p className="text-white/70 mt-4 leading-relaxed text-sm">
                        {faq.a}
                      </p>
                    </motion.details>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />

        {/* Sticky CTA mobile (apenas em mobile) */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="md:hidden fixed bottom-20 left-0 right-0 z-40 px-4"
        >
          <a
            href="mailto:contato@sevendevx.com"
            className="flex items-center justify-center gap-2 w-full bg-white text-black py-4 font-bold uppercase text-sm tracking-wider shadow-lg hover:bg-white/90 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Enviar Proposta
          </a>
        </motion.div>
      </div>
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default Fornecedores;
