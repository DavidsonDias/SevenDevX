/**
 * 🚀 Services.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/Services.tsx
 * @module Public
 * @route /services
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Serviços oferecidos, alimentados pelo CMS `services_cms`.
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
 * Services
 *    ├── Header
 *    ├── Footer
 *    ├── WhatsAppButton
 *    ├── SectionDivider
 *    ├── SEOHead
 *    ├── ProcessSection
 *    ├── FAQSection
 *    └── ServiceCard3D
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

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SectionDivider from "@/components/SectionDivider";
import SEOHead from "@/components/SEOHead";
import ProcessSection from "@/components/services/ProcessSection";
import FAQSection from "@/components/services/FAQSection";
import ServiceCard3D from "@/components/ServiceCard3D";
import { ArrowRight, Code, Settings, Wrench, FileText, Lightbulb, Sparkles, Briefcase, Layers, Rocket, Palette, Database } from "lucide-react";
import serviceDev from "@/assets/images/service-web-dev.webp";
import serviceSoftware from "@/assets/images/service-software.webp";
import serviceMaintenance from "@/assets/images/service-maintenance.webp";
import serviceLanding from "@/assets/images/service-landing.webp";
import serviceConsulting from "@/assets/images/service-consulting.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useServicesPageServices } from "@/hooks/useEcosystem";

// Resolver dinâmico de ícones lucide (qualquer nome, com fallback)
import { resolveLucideIcon } from "@/components/ui/LucideIconRender";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

// Map slug -> default cover (fallback de imagem)
const COVER_BY_SLUG: Record<string, string> = {
  "desenvolvimento-web-personalizado": serviceDev,
  "web-development": serviceDev,
  "web-apps": serviceDev,
  "software-development": serviceSoftware,
  "software": serviceSoftware,
  "maintenance": serviceMaintenance,
  "landing-pages": serviceLanding,
  "consulting": serviceConsulting,
  "consultoria-tecnologica": serviceConsulting,
  "saas": serviceDev,
  "ia": serviceConsulting,
  "mobile": serviceDev,
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const Services = () => {
  const { t, language } = useLanguage();

  // 📊 Track page view
  useAnalytics();

  // CMS-first: catálogo completo da página /serviços
  const { data: cmsServices } = useServicesPageServices();

  // Fallback institucional (i18n) — usado se CMS estiver vazio
  const fallbackServices = [
    { key: "webDev", title: t.servicesPage.webDev.title, description: t.servicesPage.webDev.description, features: t.servicesPage.webDev.features, image: serviceDev, icon: Code },
    { key: "landingPages", title: t.servicesPage.landingPages.title, description: t.servicesPage.landingPages.description, features: t.servicesPage.landingPages.features, image: serviceLanding, icon: FileText },
    { key: "consulting", title: t.servicesPage.consulting.title, description: t.servicesPage.consulting.description, features: t.servicesPage.consulting.features, image: serviceConsulting, icon: Lightbulb },
    { key: "software", title: t.servicesPage.software.title, description: t.servicesPage.software.description, features: t.servicesPage.software.features, image: serviceSoftware, icon: Settings },
    { key: "maintenance", title: t.servicesPage.maintenance.title, description: t.servicesPage.maintenance.description, features: t.servicesPage.maintenance.features, image: serviceMaintenance, icon: Wrench },
  ];

  // Mapa slug -> chave de tradução para herdar features quando CMS não tem
  const SLUG_TO_I18N: Record<string, string> = {
    "desenvolvimento-web-personalizado": "webDev",
    "web-apps": "webDev",
    "landing-pages": "landingPages",
    "consultoria-tecnologica": "consulting",
    "software": "software",
    "maintenance": "maintenance",
  };

  const services = (cmsServices && cmsServices.length > 0)
    ? cmsServices.map((s: any) => {
        const cmsFeatures: string[] = Array.isArray(s.features)
          ? s.features.map((f: any) => (typeof f === "string" ? f : f?.title)).filter(Boolean)
          : [];
        const i18nKey = SLUG_TO_I18N[s.slug];
        const i18nFeatures: string[] | undefined = i18nKey
          ? ((t.servicesPage as any)[i18nKey]?.features as string[])
          : undefined;
        return {
          key: s.id,
          title: s.title,
          description: s.subtitle || s.description,
          features: cmsFeatures.length > 0 ? cmsFeatures : (i18nFeatures || []),
          image: s.cover_image || COVER_BY_SLUG[s.slug] || serviceDev,
          icon: resolveLucideIcon(s.icon),
        };
      })
    : fallbackServices;

  // SEO meta tags por idioma
  const seoData = {
    pt: {
      title: "Serviços - SevenDevX | Desenvolvimento Web Premium",
      description: "SevenDevX: desenvolvimento web React/TypeScript, landing pages, consultoria tecnológica, instalação software e manutenção de computadores.",
      keywords: "SevenDevX serviços, desenvolvimento web, landing pages, consultoria tecnológica, instalação software, manutenção computadores, React, TypeScript",
    },
    en: {
      title: "Services - SevenDevX | Premium Web Development",
      description: "SevenDevX: React/TypeScript web development, landing pages, technology consulting, software installation and computer maintenance.",
      keywords: "SevenDevX services, web development, landing pages, technology consulting, software installation, computer maintenance, React, TypeScript",
    },
    es: {
      title: "Servicios - SevenDevX | Desarrollo Web Premium",
      description: "SevenDevX: desarrollo web React/TypeScript, landing pages, consultoría tecnológica, instalación de software y mantenimiento de computadoras.",
      keywords: "SevenDevX servicios, desarrollo web, landing pages, consultoría tecnológica, instalación software, mantenimiento computadoras, React, TypeScript",
    },
  };

  const currentSeo = seoData[language];

  return (
    <>
      {/* =========================
          SEO Optimized
         ========================= */}
      <SEOHead
        title={currentSeo.title}
        description={currentSeo.description}
        keywords={currentSeo.keywords}
        url="https://www.sevendevx.com/services"
        type="website"
        image="https://www.sevendevx.com/og-image.jpg"
      />

      {/* =========================
          Página
         ========================= */}
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main id="main-content" className="pt-20 focus:outline-none" tabIndex={-1}>
          {/* ---------------------------------------------------------
              HERO SECTION (Full-Screen Layout)
             --------------------------------------------------------- */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex items-center overflow-hidden bg-black"
            aria-label={t.servicesPage.heroTitle}
            role="region"
          >
            {/* ===========================
                MOBILE LAYOUT (Stacked)
               =========================== */}
            <div className="flex flex-col w-full md:hidden">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-[50vh] min-h-[280px] relative"
              >
                <picture>
                  <source srcSet={serviceDev} type="image/webp" />
                  <img
                    src={serviceDev}
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="px-4 py-10 text-center space-y-4"
              >
                <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold uppercase tracking-tight leading-tight">
                  {t.servicesPage.heroTitle}
                </h1>
                <p className="text-sm xs:text-base text-white/90 leading-relaxed max-w-xl mx-auto">
                  {t.servicesPage.heroSubtitle}
                </p>
              </motion.div>
            </div>

            {/* ===========================
                DESKTOP LAYOUT (Background + Overlay)
               =========================== */}
            <div className="hidden md:flex md:items-end w-full h-screen">
              {/* Background Image */}
              <div className="absolute inset-0 z-0" aria-hidden="true">
                <picture>
                  <source srcSet={serviceDev} type="image/webp" />
                  <img
                    src={serviceDev}
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black/90"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 xl:px-24 pb-20 md:pb-24 lg:pb-32">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="max-w-4xl mx-auto lg:max-w-5xl xl:max-w-6xl"
                >
                  <h1 className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold mb-6 uppercase tracking-tight leading-tight">
                    {t.servicesPage.heroTitle}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                    {t.servicesPage.heroSubtitle}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* 🔽 DIVISOR 1 — HERO → SERVIÇOS */}
          <SectionDivider
            size="lg"
            speed={1.4}
            glowIntensity="intense"
            className="my-20"
          />

          {/* ---------------------------------------------------------
              SERVIÇOS GRID COM CARDS 3D
             --------------------------------------------------------- */}
          <section className="py-20 px-4 md:px-8 lg:px-16 bg-background">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-4">
                  {t.servicesPage.whatWeOffer}
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto text-lg">
                  {t.servicesPage.whatWeOfferSubtitle}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <motion.div
                      key={service.key}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <ServiceCard3D
                        tiltIntensity={12}
                        glowIntensity={0.4}
                        glowColor="59, 130, 246"
                        className="h-full"
                      >
                        <div className="relative h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group">
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={service.image}
                              alt={service.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            
                            {/* Icon Badge */}
                            <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                              <IconComponent size={24} className="text-white" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold uppercase tracking-wide">
                              {service.title}
                            </h3>
                            <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                              {service.description}
                            </p>

                            {/* Features */}
                            <ul className="space-y-2 pt-2">
                              {service.features.slice(0, 3).map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-start gap-2 text-white/60 text-sm"
                                >
                                  <ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Hover Glow Effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                          </div>
                        </div>
                      </ServiceCard3D>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 🔽 DIVISOR — SERVIÇOS → PROCESSO */}
          <SectionDivider
            size="md"
            speed={1}
            glowIntensity="default"
            className="my-16"
          />

          {/* ---------------------------------------------------------
              PROCESSO (How It Works) — Enterprise Premium
             --------------------------------------------------------- */}
          <ProcessSection />

          {/* 🔽 DIVISOR — PROCESSO → FAQ */}
          <SectionDivider
            size="md"
            speed={1}
            glowIntensity="default"
            className="my-16"
          />

          {/* ---------------------------------------------------------
              FAQ — Accordion enterprise + JSON-LD FAQPage
             --------------------------------------------------------- */}
          <FAQSection />

          {/* 🔽 DIVISOR ANTES CTA */}
          <SectionDivider
            size="md"
            speed={1}
            glowIntensity="default"
            className="my-24"
          />

          {/* ---------------------------------------------------------
              CTA SECTION (Full-Screen)
             --------------------------------------------------------- */}
          <section
            className="relative h-screen flex items-center bg-background"
            aria-label={t.servicesPage.ctaTitle}
            role="region"
          >
            <div className="container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tight">
                  {t.servicesPage.ctaTitle}
                </h2>
                <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                  {t.servicesPage.ctaSubtitle}
                </p>
                <a
                  href="https://wa.me/5531984740625"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.servicesPage.ctaButton}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 border-2 border-white px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300"
                  >
                    <span>{t.servicesPage.ctaButton}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </motion.button>
                </a>
              </motion.div>
            </div>
          </section>

          {/* 🔽 DIVISOR ANTES FOOTER */}
          <SectionDivider
            size="sm"
            speed={0.8}
            glowIntensity="subtle"
            className="mt-16 mb-10"
          />
          {/* Internal Linking — SEO */}
          <section className="py-16 px-4 md:px-8 lg:px-16 bg-background border-t border-border/10">
            <div className="container mx-auto text-center">
              <p className="text-muted-foreground text-sm mb-4">
                {language === "pt" ? "Veja nossos projetos reais e artigos técnicos" :
                 language === "es" ? "Vea nuestros proyectos reales y artículos técnicos" :
                 "See our real projects and technical articles"}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a href="/projects-hub" className="text-sm font-semibold text-primary hover:underline">
                  {language === "pt" ? "Portfólio →" : language === "es" ? "Portafolio →" : "Portfolio →"}
                </a>
                <a href="/blog" className="text-sm font-semibold text-primary hover:underline">
                  Blog →
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />

        {/* JSON-LD: Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: language === "pt" ? "Serviços da SevenDevX" : "SevenDevX Services",
              itemListElement: services.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Service",
                  name: s.title,
                  description: s.description,
                  provider: {
                    "@type": "Organization",
                    name: "SevenDevX",
                    url: "https://www.sevendevx.com",
                  },
                },
              })),
            }),
          }}
        />
      </div>
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default Services;
