/**
 * 🚀 Projects.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/Projects.tsx
 * @module Public
 * @route /projects
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Listagem do portfólio com filtros.
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
 * Projects
 *    ├── Header
 *    ├── Footer
 *    ├── WhatsAppButton
 *    ├── SEOHead
 *    ├── SectionDivider
 *    ├── TechShowcase
 *    └── PortfolioCarousel3D
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Componentes pesados carregados sob demanda (`React.lazy`)
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

import { Suspense, lazy, useEffect } from "react";
import { motion } from "framer-motion";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead from "@/components/SEOHead";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import SectionDivider from "@/components/SectionDivider";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";

import heroBackground from "@/assets/images/hero-tech-workspace.webp";
import projectsShowcase from "@/assets/images/projects-showcase.webp";

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

const TechShowcase = lazy(() => import("@/components/TechShowcase"));
const PortfolioCarousel3D = lazy(() => import("@/components/PortfolioCarousel3D"));

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const Projects = () => {
  const { t } = useLanguage();
  
  // 📊 Track page view
  useAnalytics();
  
  // Preload images (prevent CLS)
  useEffect(() => {
    [heroBackground, projectsShowcase].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <>
      {/* =========================
          SEO Optimized
         ========================= */}
      <SEOHead
        title="Portfólio de Projetos | SevenDevX — Sites, SaaS & Sistemas Web"
        description="Portfólio completo da SevenDevX: sites profissionais, sistemas web, SaaS, landing pages e dashboards. Projetos reais com React, TypeScript e Node.js."
        keywords="portfólio desenvolvimento web, projetos React, sites profissionais, SaaS, landing pages, sistemas web, dashboard, e-commerce, SevenDevX, full stack, aplicações web modernas"
        url="https://www.sevendevx.com/projects"
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
   HERO SECTION (Full-Screen Layout - NOVO)
   --------------------------------------------------------- */}
<motion.section
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
  className="relative min-h-screen flex items-center overflow-hidden bg-black"
  aria-label={t.projects.heroTitle}
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
        <source srcSet={heroBackground} type="image/webp" />
        <img
          src={heroBackground}
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
        {t.projects.heroTitle}
      </h1>
      <p className="text-sm xs:text-base text-white/90 leading-relaxed max-w-xl mx-auto">
        {t.projects.heroSubtitle}
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
        <source srcSet={heroBackground} type="image/webp" />
        <img
          src={heroBackground}
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
          {t.projects.heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
          {t.projects.heroSubtitle}
        </p>
      </motion.div>
    </div>
  </div>
</motion.section>


          {/* 🔽 DIVISOR 1 — HERO → TECH (Grande, dramático) */}
          <SectionDivider
            size="lg"
            speed={1.4}
            glowIntensity="intense"
            className="my-20"
          />

          {/* ---------------------------------------------------------
             TECH SHOWCASE (Lazy-loaded)
             --------------------------------------------------------- */}
          <section aria-label={t.projects.techShowcaseTitle} role="region">
            <Suspense
              fallback={
                <div 
                  className="min-h-[240px] flex items-center justify-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="text-white/60 uppercase tracking-wider animate-pulse">
                    {t.tech.sectionTitle}...
                  </div>
                </div>
              }
            >
              <TechShowcase />
            </Suspense>
          </section>

          {/* 🔽 DIVISOR 2 — TECH → PORTFOLIO (Médio, padrão) */}
          <SectionDivider
            size="md"
            speed={1}
            glowIntensity="default"
            className="my-24"
          />

          {/* ---------------------------------------------------------
             PORTFOLIO SECTION (Lazy-loaded)
             --------------------------------------------------------- */}
          <section
            className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 overflow-hidden"
            aria-label={t.projects.portfolioTitle}
            role="region"
          >
            <div className="absolute inset-0 z-0" aria-hidden="true">
              <picture>
                <source srcSet={projectsShowcase} type="image/webp" />
                <img
                  src={projectsShowcase}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-full h-full object-cover opacity-10"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
            </div>

            <div className="relative z-10 w-full">
              <Suspense fallback={<AppLoaderOrbital />}>
                <PortfolioCarousel3D />
              </Suspense>
            </div>
          </section>

          {/* 🔽 DIVISOR 3 — PORTFOLIO → FOOTER (Pequeno, discreto) */}
          <SectionDivider
            size="sm"
            speed={0.8}
            glowIntensity="subtle"
            className="mt-16 mb-10"
          />
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default Projects;