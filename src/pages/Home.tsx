/**
 * 🧩 Home.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 *
 * @file src/pages/Home.tsx
 * @module Public
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Composição da home pública (hero, serviços, stack, projetos e
 * contato).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Aplica metadados SEO/GEO da rota
 *
 * @see src/pages/README.md
 * @see docs/architecture/MODULE_MAP.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ServicesPreview from "@/components/ServicesPreview";
import FeaturedProjects from "@/components/FeaturedProjects";
import TechPreview from "@/components/TechPreview";
import TestimonialsCarousel3D from "@/components/TestimonialsCarousel3D";
import ContactMultiStep from "@/components/ContactMultiStep";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead from "@/components/SEOHead";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SectionDivider from "@/components/SectionDivider";
import { useAnalytics } from "@/hooks/useAnalytics";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const Home = () => {
  // 📊 Track page view
  useAnalytics();

  return (
    <>
      {/* =========================
          SEO Optimized
         ========================= */}
      <SEOHead
        title="SevenDevX | Criação de Sites & Desenvolvimento Web Profissional"
        description="Criação de sites profissionais, landing pages de alta conversão, sistemas web e SaaS. Desenvolvimento full stack com React, TypeScript e Node.js em Belo Horizonte."
        keywords="criação de sites, desenvolvimento web, landing page, desenvolvedor full stack, criação de sites profissionais, sistemas web, SaaS, React, TypeScript, Node.js, Belo Horizonte, SevenDevX, como criar um site profissional, quanto custa um site, melhores tecnologias para desenvolvimento web"
        image="https://www.sevendevx.com/og-image.jpg"
        url="https://www.sevendevx.com"
        type="website"
      />

      {/* =========================
          Página
         ========================= */}
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main id="main-content" className="focus:outline-none" tabIndex={-1}>
          {/* ---------------------------------------------------------
             HERO SECTION (Vídeo autoplay + fallback)
             --------------------------------------------------------- */}
          <Hero />

          {/* 🔽 DIVISOR 1 — HERO → SERVICES (Grande, dramático) */}
          <SectionDivider
            size="lg"
            speed={1.5}
            glowIntensity="intense"
            className="my-20"
          />

          {/* ---------------------------------------------------------
             SERVICES PREVIEW
             --------------------------------------------------------- */}
          <ServicesPreview />

          {/* 🔽 DIVISOR 2 — SERVICES → PROJECTS */}
          <SectionDivider
            size="md"
            speed={1}
            glowIntensity="default"
            className="my-24"
          />

          {/* ---------------------------------------------------------
             FEATURED PROJECTS (Prova real)
             --------------------------------------------------------- */}
          <FeaturedProjects />

          {/* 🔽 DIVISOR 3 — PROJECTS → TECH */}
          <SectionDivider
            size="md"
            speed={1}
            glowIntensity="default"
            className="my-24"
          />

          {/* ---------------------------------------------------------
             TECH PREVIEW (Showcase de tecnologias)
             --------------------------------------------------------- */}
          <TechPreview />

          {/* 🔽 DIVISOR 3 — TECH → TESTIMONIALS (Médio, padrão) */}
          <SectionDivider
            size="md"
            speed={1}
            glowIntensity="default"
            className="my-24"
          />

          {/* ---------------------------------------------------------
             TESTIMONIALS (Validação social)
             --------------------------------------------------------- */}
          <TestimonialsCarousel3D />

          {/* 🔽 DIVISOR 4 — TESTIMONIALS → CONTACT (Médio, sutil) */}
          <SectionDivider
            size="md"
            speed={0.9}
            glowIntensity="subtle"
            className="my-20"
          />

          {/* ---------------------------------------------------------
             CONTACT MULTI-STEP (Formulário / WhatsApp)
             --------------------------------------------------------- */}
          <ContactMultiStep />

          {/* 🔽 DIVISOR 5 — CONTACT → FOOTER (Pequeno, discreto) */}
          <SectionDivider
            size="sm"
            speed={0.8}
            glowIntensity="subtle"
            className="mt-16 mb-10"
          />
        </main>

        <Footer />
        <WhatsAppButton />
        <ExitIntentPopup />
      </div>
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default Home;