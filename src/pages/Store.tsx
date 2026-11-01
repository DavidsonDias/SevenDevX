import StoreHeroShowroom from '@/components/StoreHeroShowroom';
import StoreScopeBuilder from '@/components/StoreScopeBuilder';
import StoreProjectProof from '@/components/StoreProjectProof';
import StoreSectionNav from '@/components/StoreSectionNav';
import '@/components/store-refinements.css';
import StoreSolutionGuide from '@/components/StoreSolutionGuide';
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

import { usePublicCopy } from "@/i18n/usePublicCopy";
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
const Fallback = () => {
  const { copy } = usePublicCopy();
  return (
  <div className="w-full flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/40" aria-hidden />
    <span className="sr-only">{copy("Carregando...")}</span>
  </div>
);
};

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
const buildJsonLd = (copy: (value: string) => string) => {
  const productEntries = plans.map((p) => ({
    "@type": "Product",
    "name": copy(p.name),
    "description": copy(p.description),
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
    "name": copy(s.title),
    "description": copy(s.description),
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
        "name": copy("Loja - SevenDevX"),
        "url": "https://www.sevendevx.com/store",
        "description": copy("Catálogo de soluções digitais SevenDevX — landing pages, sites institucionais e sistemas customizados.")
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
const ComparisonTable = ({selected}:{selected:string|null}) => {
  const { copy } = usePublicCopy();
  const [differences,setDifferences]=useState(false);
  const {language}=useLanguage();
  const differenceLabel={pt:'Mostrar só diferenças',en:'Show differences only',es:'Mostrar solo diferencias'}[language];
  return (
    <section id="store-compare" aria-labelledby="compare-heading" className="py-12">
      <div className="max-w-6xl mx-auto px-4 store-comparison-scroll" role="region" aria-label={copy("Comparativo Rápido")} tabIndex={0}>
        <h3 id="compare-heading" className="text-2xl font-bold mb-6 uppercase tracking-tight">{copy("Comparativo Rápido")}</h3>
        <button type="button" className="store-differences" aria-pressed={differences} onClick={()=>setDifferences(value=>!value)}>{differenceLabel} {differences?"✓":""}</button>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm text-white/70">
              <th scope="col" className="pb-3">{copy("Recurso")}</th>
              {plans.map((p) => (
                <th scope="col" key={p.id} data-selected={selected===p.id} className="pb-3 text-right">{copy(p.name)}</th>
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
            ].filter(row=>!differences||new Set(row.slice(1)).size>1).map((row, i) => (
              <tr key={i} className="border-t border-white/6">
                <th scope="row" className="py-3 text-sm text-white/70 font-normal">{copy(row[0])}</th>
                {row.slice(1).map((cell, idx) => (
                  <td key={idx} data-selected={selected===plans[idx]?.id} className="py-3 text-sm text-right">
                    {cell === true ? <Check className="inline-block mr-1" aria-label={copy("Incluído")} /> : cell === false ? <span aria-label={copy("Não incluído")}>—</span> : copy(cell)}
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
  const { copy, message } = usePublicCopy();
  const { t,language } = useLanguage();
  const scopeWords={pt:["Montar escopo","Adicionar ao escopo","Montar meu escopo antes de conversar"],en:["Build scope","Add to scope","Build my scope before getting in touch"],es:["Crear alcance","Añadir al alcance","Crear mi alcance antes de contactar"]}[language];
  const [scopePlanId,setScopePlanId]=useState<string>();
  const [scopePlanRevision,setScopePlanRevision]=useState(0);
  const [requestedService,setRequestedService]=useState<{id:string;nonce:number}>();
  const startScope=(id:string)=>{setScopePlanId(id);setScopePlanRevision(value=>value+1);document.getElementById("store-scope")?.scrollIntoView({behavior:"auto",block:"start"});};
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

  const jsonLd = useMemo(() => JSON.stringify(buildJsonLd(copy)), [copy]);

  const handleContact = (planName: string) => {
    // Compose sanitized message
    const sanitized = sanitize(message("Olá! Gostaria de saber mais sobre: {plan}", { plan: copy(planName) }));
    const encoded = encodeURIComponent(sanitized);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* SEOHead lazy loaded for code-splitting: provides meta tags + open graph */}
      <Suspense fallback={<Fallback />}>
        <SEOHead
          title={copy("Loja - SevenDevX | Soluções Digitais Premium")}
          description={copy("Landing pages, sites institucionais e sistemas sob medida. Consultoria, otimização de performance e suporte profissional.")}
          keywords="desenvolvimento web, landing page, site institucional, sistema customizado, consultoria digital, UI/UX design"
          url="https://www.sevendevx.com/store"
          type="website"
          image="https://www.sevendevx.com/logo-512.png"
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

        <main id="main-content" className="store-refined pt-20 focus:outline-none" tabIndex={-1}>
          {/* Hero */}
          <StoreHeroShowroom plans={plans} onBuild={startScope} />

          <StoreSectionNav />
          <StoreSolutionGuide plans={plans} onChoose={id=>{setSelectedPlanId(id);const el=document.querySelector<HTMLElement>(`[data-plan-id='${id}']`);el?.scrollIntoView({behavior:'auto',block:'center'});el?.focus({preventScroll:true});}} />
          {/* Plans */}
          <section id="plans" data-store-section="02" aria-labelledby="plans-heading" className="relative py-20 md:py-32 bg-black">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 id="plans-heading" className="text-[clamp(1.5rem,4.5vw,3.75rem)] break-words font-bold mb-6 uppercase tracking-tight">
                  {copy("Planos de Desenvolvimento")}
                </h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  {copy("Escolha a solução ideal para o seu projeto — preços transparentes e entregas objetivas.")}
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
                        selectedPlanId===plan.id ? "bg-white/5 border-white store-plan-selected" : plan.highlight ? "bg-white/5 border-white" : "border-white/10 hover:border-white/30"
                      }`}
                      onFocus={() => setSelectedPlanId(plan.id)}
                    >
                      {plan.highlight && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-white text-black px-4 py-1 text-xs uppercase tracking-widest font-bold">{copy("Mais Popular")}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-6">
                        <Icon size={32} className="text-white/80" aria-hidden />
                        <div className="text-right">
                          <div className="text-sm text-white/60">{copy(plan.delivery)}</div>
                        </div>
                      </div>

                      <h3 id={`plan-${plan.id}-title`} className="text-2xl md:text-3xl font-bold mb-3 uppercase tracking-tight">
                        {copy(plan.name)}
                      </h3>

                      <p className="text-white/70 text-sm mb-6 leading-relaxed">{copy(plan.description)}</p>

                      <div className="mb-6">
                        <span className="text-3xl font-bold tracking-tight">{copy(plan.price)}</span>
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
                          aria-label={`${copy("Solicitar Orçamento")} — ${plan.name}`}
                        >
                          {copy("Solicitar Orçamento")}
                        </button>

                        <button
                          onClick={() => {setSelectedPlanId(plan.id);const el=document.getElementById("store-compare");el?.scrollIntoView({behavior:"auto",block:"start"});el?.querySelector<HTMLElement>("[role=region]")?.focus({preventScroll:true});}}
                          className="px-3 py-3 border border-white/10 text-sm"
                          aria-pressed={selectedPlanId === plan.id}
                        >
                          {copy("Comparar")}
                        </button>
                      </div>
                    <button className="store-use-scope" type="button" onClick={()=>startScope(plan.id)}>{scopeWords[0]} ↗</button>
                    </motion.article>
                  );
                })}
              </div>

              {/* Comparison table for conversion clarity */}
              <ComparisonTable selected={selectedPlanId} />
            </div>
          </section>

          {/* Services */}
          <section id="store-services" data-store-section="03" className="relative py-20 md:py-32 bg-black border-t border-white/10 overflow-x-clip" aria-label={copy("Serviços Premium")}>
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tight">{copy("Serviços Premium")}</h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  {copy("Suporte e otimização contínua para garantir resultados reais.")}
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
                    <div className="store-service-marker" aria-hidden="true">{String(idx+1).padStart(2,"0")}<span>{React.createElement([Sparkles,Zap,Check,Shield][idx],{size:20})}</span></div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase tracking-tight">{copy(service.title)}</h3>
                    <p className="text-white/70 text-sm mb-6 leading-relaxed">{copy(service.description)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold tracking-tight">{copy(service.price)}</span>
                      <button
                        onClick={() => handleContact(service.title)}
                        className="border border-white/30 px-4 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                      >
                        {copy("Contratar")}
                      </button>
                    </div>
                    <button className="store-use-scope" type="button" onClick={()=>{setRequestedService({id:service.id,nonce:Date.now()});document.getElementById("store-scope")?.scrollIntoView({behavior:"auto",block:"start"});}}>{scopeWords[1]} +</button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <StoreScopeBuilder plans={plans} services={services} onContact={handleContact} initialPlanId={scopePlanId} initialPlanRevision={scopePlanRevision} requestedService={requestedService} />
          <StoreProjectProof />
          {/* Testimonials & Social Proof */}
          <section id="store-stories" data-store-section="04" className="relative py-16 md:py-24 bg-black border-t border-white/10" aria-label={copy("Depoimentos")}>
            <div className="container mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">{copy("Depoimentos")}</h2>
                <p className="text-white/70 max-w-2xl mx-auto">{copy("Casos reais e resultados mensuráveis — o que clientes falam sobre nós.")}</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {testimonials.map((t, i) => (
                  <motion.blockquote key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} className="p-6 border border-white/10 rounded-lg">
                    <p className="text-white/80 mb-4">“{copy(t.message)}”</p>
                    <footer className="text-sm text-white/60 font-semibold">{t.name} — <span className="font-normal">{copy(t.role)}</span></footer>
                  </motion.blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section id="store-contact" data-store-section="05" className="relative py-20 md:py-32 bg-black border-t border-white/10 overflow-x-clip">
            <div className="container mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase tracking-tight">{copy("Pronto para Decolar?")}</h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">{copy("Fale com a nossa equipe e receba uma análise gratuita do seu projeto com recomendações práticas.")}</p>
                <a className="store-contact-scope-link" href="#store-scope">{scopeWords[2]} ↗</a>
                <motion.button onClick={() => handleContact("Consultoria Gratuita")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-3 border-2 border-white bg-white text-black px-8 py-4 text-sm uppercase font-semibold transition-all duration-300">
                  <span>{copy("Falar com Especialista")}</span>
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