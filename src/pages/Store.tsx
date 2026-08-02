/**
 * 🚀 Store.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/Store.tsx
 * @module Public
 * @route /store
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Vitrine de produtos e pacotes.
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
 * Store
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

// 📂 src/pages/Store.tsx
/**
 * 🛍️ Store.tsx — SevenDevX v1.0 PRO ULTRA++
 * -------------------------------------------------------------
 * ✅ Catálogo institucional de soluções digitais
 * ✅ SEO dinâmico via <SEOHead /> + JSON-LD Products & Services
 * ✅ Design futurista SpaceX-style
 * ✅ Responsivo mobile-first
 * ✅ Animações premium com Framer Motion
 * ✅ Lazy loading / code splitting via React.lazy + Suspense
 * ✅ Accessibility improvements (ARIA, focus, labels)
 * ✅ Copy refinado e tabelas comparativas (melhora conversão)
 * ✅ CTA integrado com WhatsApp via env var
 * ✅ Imagens otimizadas (loading lazy/eager, alt texts)
 * ✅ Sanitização de mensagens via DOMPurify
 * ✅ Micro-interactions e comentários explicativos
 * -------------------------------------------------------------
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import React, { Suspense, lazy, useState, useMemo } from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { Check, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import heroBackground from "@/assets/images/hero-tech-workspace.webp";
import { useLanguage } from "@/i18n/LanguageContext";

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

// Lazy load heavier shared UI components (code splitting)
const Header = lazy(() => import("@/components/Header"));
const Footer = lazy(() => import("@/components/Footer"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));
const SEOHead = lazy(() => import("@/components/SEOHead"));

const planIcons = [Zap, Sparkles, Shield];

// Simple suspense fallback
const Fallback = () => (
  <div className="w-full flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/40" aria-hidden />
    <span className="sr-only">Carregando...</span>
  </div>
);

/* -------------------------
   Business Data (editable)
   ------------------------- */
const plans = [
  {
    id: "landing",
    name: "Landing Page",
    description: "Página única otimizada para conversão — rápida e com foco em vendas.",
    price: "A partir de R$ 997",
    priceValue: 997,
    delivery: "Até 7 dias úteis",
    features: [
      "Design moderno e responsivo",
      "SEO on-page básico",
      "Formulário de contato + integração com WhatsApp",
      "Integração com Google Analytics",
      "Hospedagem + SSL (1 ano) — opcional",
      "Tempo de carregamento otimizado (LCP < 2s)"
    ],
    highlight: false,
    icon: Zap,
  },
  {
    id: "institucional",
    name: "Site Institucional",
    description: "Presença digital completa com até 7 páginas e painel administrativo.",
    price: "A partir de R$ 2.497",
    priceValue: 2497,
    delivery: "Até 14 dias úteis",
    features: [
      "Design exclusivo premium",
      "SEO avançado + sitemap",
      "Blog/portfólio integrado (opcional)",
      "Painel administrativo (CMS)",
      "3 meses de suporte inclusos",
      "Otimização de performance e PWA (opcional)"
    ],
    highlight: true,
    icon: Sparkles,
  },
  {
    id: "custom",
    name: "Sistema Customizado",
    description: "Soluções sob medida: APIs, painéis, integrações e segurança empresarial.",
    price: "Sob consulta",
    priceValue: null,
    delivery: "Sob estimativa (SLA)",
    features: [
      "Arquitetura escalável (backend + frontend)",
      "Integração com APIs (ERP, gateways, etc.)",
      "Autenticação, permissões e segurança",
      "Banco de dados robusto e backups",
      "Documentação técnica + deploy automatizado",
      "Suporte contínuo (contrato opcional)"
    ],
    highlight: false,
    icon: Shield,
  },
];

const services = [
  {
    id: "consultoria",
    title: "Consultoria Digital",
    description: "Análise completa (SEO, performance, UX) com relatório PDF e plano de ação.",
    price: "R$ 497",
  },
  {
    id: "performance",
    title: "Otimização de Performance",
    description: "Melhorias em Core Web Vitals e redução de TTFB/LCP (relatório antes/depois).",
    price: "R$ 797",
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    description: "Redesign + prototipação em Figma e testes de usabilidade.",
    price: "A partir de R$ 1.497",
  },
  {
    id: "manutencao",
    title: "Manutenção Mensal",
    description: "Atualizações, monitoramento, backups e suporte com SLA.",
    price: "R$ 297/mês",
  }
];

/* -------------------------
   Testimonials - social proof
   ------------------------- */
const testimonials = [
  {
    name: "Agência NovaVista",
    role: "CEO",
    message:
      "A SevenDevX entregou um e-commerce com performance excelente — vendas subiram 42% no 1º mês.",
  },
  {
    name: "Loja TecFácil",
    role: "Founder",
    message:
      "Rápido, profissional e com ótimo suporte. O site ficou muito mais rápido e limpo.",
  },
];

/* -------------------------
   Helper: get WhatsApp number from env (recommended)
   - set VITE_WHATSAPP_NUMBER=5531984740625 in .env
   ------------------------- */
const WHATSAPP_NUMBER = (import.meta.env?.VITE_WHATSAPP_NUMBER as string) || "5531984740625";

/* -------------------------
   Utility: sanitize text for whatsapp & JSON-LD safety
   ------------------------- */
const sanitize = (value: string) =>
  DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

/* -------------------------
   Product & Service JSON-LD (for rich snippets)
   - Generates structured data for each plan/service
   ------------------------- */
const buildJsonLd = () => {
  const productEntries = plans.map((p) => ({
    "@type": "Product",
    "name": p.name,
    "description": p.description,
    "sku": p.id,
    "offers": {
      "@type": "Offer",
      "price": p.priceValue ? p.priceValue.toString() : "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "url": `https://www.sevendevx.com/store#${p.id}`
    }
  }));

  const servicesEntries = services.map((s) => ({
    "@type": "Service",
    "name": s.title,
    "description": s.description,
    "provider": {
      "@type": "Organization",
      "name": "SevenDevX",
      "url": "https://www.sevendevx.com"
    }
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Loja - SevenDevX",
        "url": "https://www.sevendevx.com/store",
        "description": "Catálogo de soluções digitais SevenDevX — landing pages, sites institucionais e sistemas customizados."
      },
      ...productEntries,
      ...servicesEntries
    ]
  };
};

/* -------------------------
   Comparison Table component (inline)
   - ajuda conversão: o usuário compara planos rápido
   ------------------------- */
const ComparisonTable: React.FC = () => {
  return (
    <section aria-labelledby="compare-heading" className="py-12">
      <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
        <h3 id="compare-heading" className="text-2xl font-bold mb-6 uppercase tracking-tight">Comparativo Rápido</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm text-white/70">
              <th className="pb-3">Recurso</th>
              {plans.map((p) => (
                <th key={p.id} className="pb-3 text-right">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Design Personalizado", true, true, true],
              ["SEO Básico", true, true, true],
              ["Painel Administrativo", false, true, true],
              ["Integrações API", false, "Opções", true],
              ["Suporte Incluso", "7 dias", "3 meses", "Sob contrato"],
              ["Entrega Estimada", "7 dias", "14 dias", "Sob estimativa"],
            ].map((row, i) => (
              <tr key={i} className="border-t border-white/6">
                <td className="py-3 text-sm text-white/70">{row[0]}</td>
                {row.slice(1).map((cell, idx) => (
                  <td key={idx} className="py-3 text-sm text-right">
                    {cell === true ? <Check className="inline-block mr-1" /> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

/* -------------------------
   Main component

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

   ------------------------- */
const Store: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans = useMemo(() => [
    {
      id: "landing",
      name: t.store.plans.landing.name,
      description: t.store.plans.landing.description,
      price: "A partir de R$ 997",
      priceValue: 997,
      delivery: "Até 7 dias úteis",
      features: t.store.plans.landing.features,
      highlight: false,
      icon: planIcons[0],
    },
    {
      id: "institucional",
      name: t.store.plans.institutional.name,
      description: t.store.plans.institutional.description,
      price: "A partir de R$ 2.497",
      priceValue: 2497,
      delivery: "Até 14 dias úteis",
      features: t.store.plans.institutional.features,
      highlight: true,
      icon: planIcons[1],
    },
    {
      id: "custom",
      name: t.store.plans.custom.name,
      description: t.store.plans.custom.description,
      price: "Sob consulta",
      priceValue: null,
      delivery: "Sob estimativa (SLA)",
      features: t.store.plans.custom.features,
      highlight: false,
      icon: planIcons[2],
    },
  ], [t]);

  const services = useMemo(() => [
    { id: "consultoria", title: t.store.services.consulting.title, description: t.store.services.consulting.description, price: "R$ 497" },
    { id: "performance", title: t.store.services.performance.title, description: t.store.services.performance.description, price: "R$ 797" },
    { id: "uiux", title: t.store.services.uiux.title, description: t.store.services.uiux.description, price: "A partir de R$ 1.497" },
    { id: "manutencao", title: t.store.services.maintenance.title, description: t.store.services.maintenance.description, price: "R$ 297/mês" },
  ], [t]);

  const jsonLd = useMemo(() => JSON.stringify(buildJsonLd()), []);

  const handleContact = (planName: string) => {
    // Compose sanitized message
    const sanitized = sanitize(`Olá! Gostaria de saber mais sobre: ${planName}`);
    const encoded = encodeURIComponent(sanitized);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* SEOHead lazy loaded for code-splitting: provides meta tags + open graph */}
      <Suspense fallback={<Fallback />}>
        <SEOHead
          title="Loja - SevenDevX | Soluções Digitais Premium"
          description="Landing pages, sites institucionais e sistemas sob medida. Consultoria, otimização de performance e suporte profissional."
          keywords="desenvolvimento web, landing page, site institucional, sistema customizado, consultoria digital, UI/UX design"
          url="https://www.sevendevx.com/store"
          type="website"
          image="https://www.sevendevx.com/og-image.jpg"
        />
      </Suspense>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Page */}
      <div className="min-h-screen bg-background text-foreground">
        {/* Header (lazy) */}
        <Suspense fallback={<Fallback />}>
          <Header />
        </Suspense>

        <main id="main-content" className="pt-20 focus:outline-none" tabIndex={-1}>
          {/* Hero */}
          <section
            className="relative min-h-[70vh] md:h-screen flex items-end overflow-hidden section-overlay"
            aria-label="Catálogo de Soluções Digitais"
          >
            <div className="absolute inset-0 z-0">
              <img
                src={heroBackground}
                alt="Soluções digitais premium SevenDevX"
                loading="eager"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black/95" />
            </div>

            <div className="container mx-auto px-6 pb-20 md:pb-32 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl"
              >
                <div className="inline-flex items-center space-x-2 border border-white/30 px-4 py-2 mb-6 text-xs uppercase tracking-widest">
                  <Sparkles size={14} className="text-white/80" />
                  <span className="text-white/80">Soluções Premium</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 uppercase tracking-tight leading-tight">
                  Transforme sua Visão em Realidade Digital
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mb-8">
                  Do conceito ao lançamento — entregamos soluções com design premium, performance otimizada e suporte que garante resultados.
                </p>

                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => {
                      // focus first plan card
                      const el = document.querySelector<HTMLElement>("[data-plan-id='institucional']");
                      el?.focus();
                      setSelectedPlanId("institucional");
                    }}
                    className="inline-flex items-center gap-2 border-2 border-white px-6 py-3 text-sm uppercase tracking-widest font-semibold hover:bg-white hover:text-black transition-all duration-300"
                  >
                    Ver Plano Mais Popular
                    <ArrowRight size={16} />
                  </button>

                  <a
                    href="#plans"
                    className="inline-flex items-center gap-2 border-2 border-white/40 px-6 py-3 text-sm uppercase tracking-widest font-semibold hover:bg-white/5 transition-all duration-300"
                  >
                    Ver Todos os Planos
                  </a>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Plans */}
          <section id="plans" aria-labelledby="plans-heading" className="relative py-20 md:py-32 bg-black">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 id="plans-heading" className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tight">
                  Planos de Desenvolvimento
                </h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  Escolha a solução ideal para o seu projeto — preços transparentes e entregas objetivas.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan, index) => {
                  const Icon = plan.icon;
                  return (
                    <motion.article
                      key={plan.id}
                      data-plan-id={plan.id}
                      tabIndex={0}
                      aria-labelledby={`plan-${plan.id}-title`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.08 }}
                      className={`relative border rounded-xl p-8 transition-all duration-300 group ${
                        plan.highlight ? "bg-white/5 border-white" : "border-white/10 hover:border-white/30"
                      }`}
                      onFocus={() => setSelectedPlanId(plan.id)}
                    >
                      {plan.highlight && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-white text-black px-4 py-1 text-xs uppercase tracking-widest font-bold">Mais Popular</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-6">
                        <Icon size={32} className="text-white/80" aria-hidden />
                        <div className="text-right">
                          <div className="text-sm text-white/60">{plan.delivery}</div>
                        </div>
                      </div>

                      <h3 id={`plan-${plan.id}-title`} className="text-2xl md:text-3xl font-bold mb-3 uppercase tracking-tight">
                        {plan.name}
                      </h3>

                      <p className="text-white/70 text-sm mb-6 leading-relaxed">{plan.description}</p>

                      <div className="mb-6">
                        <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                      </div>

                      <ul className="space-y-3 mb-6 text-sm">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="mt-1 text-white/80 flex-shrink-0" />
                            <span className="text-white/90">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => handleContact(plan.name)}
                          className={`flex-1 px-4 py-3 text-sm uppercase font-semibold transition-all duration-300 ${
                            plan.highlight ? "bg-white text-black border border-white" : "border border-white/20 hover:bg-white/5"
                          }`}
                          aria-label={`Solicitar orçamento para ${plan.name}`}
                        >
                          Solicitar Orçamento
                        </button>

                        <button
                          onClick={() => setSelectedPlanId(plan.id)}
                          className="px-3 py-3 border border-white/10 text-sm"
                          aria-pressed={selectedPlanId === plan.id}
                        >
                          Ver
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>

              {/* Comparison table for conversion clarity */}
              <ComparisonTable />
            </div>
          </section>

          {/* Services */}
          <section className="relative py-20 md:py-32 bg-black border-t border-white/10" aria-label="Serviços Premium">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tight">Serviços Premium</h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  Suporte e otimização contínua para garantir resultados reais.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {services.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    className="border border-white/10 p-8 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                  >
                    <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase tracking-tight">{service.title}</h3>
                    <p className="text-white/70 text-sm mb-6 leading-relaxed">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold tracking-tight">{service.price}</span>
                      <button
                        onClick={() => handleContact(service.title)}
                        className="border border-white/30 px-4 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                      >
                        Contratar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials & Social Proof */}
          <section className="relative py-16 md:py-24 bg-black border-t border-white/10" aria-label="Depoimentos">
            <div className="container mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">Depoimentos</h2>
                <p className="text-white/70 max-w-2xl mx-auto">Casos reais e resultados mensuráveis — o que clientes falam sobre nós.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {testimonials.map((t, i) => (
                  <motion.blockquote key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} className="p-6 border border-white/10 rounded-lg">
                    <p className="text-white/80 mb-4">“{t.message}”</p>
                    <footer className="text-sm text-white/60 font-semibold">{t.name} — <span className="font-normal">{t.role}</span></footer>
                  </motion.blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative py-20 md:py-32 bg-black border-t border-white/10">
            <div className="container mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase tracking-tight">Pronto para Decolar?</h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">Fale com a nossa equipe e receba uma análise gratuita do seu projeto com recomendações práticas.</p>
                <motion.button onClick={() => handleContact("Consultoria Gratuita")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-3 border-2 border-white bg-white text-black px-8 py-4 text-sm uppercase font-semibold transition-all duration-300">
                  <span>Falar com Especialista</span>
                  <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer & WhatsApp Button (lazy) */}
        <Suspense fallback={<Fallback />}>
          <Footer />
          <WhatsAppButton />
        </Suspense>
      </div>
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default Store;