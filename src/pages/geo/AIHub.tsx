/**
 * 🚀 AIHub.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/geo/AIHub.tsx
 * @module Public/GEO
 * @route /ai
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Hub de conteúdo otimizado para citação por assistentes de IA.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `AIHub`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Aplica metadados SEO/GEO da rota
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🧩 ARQUITETURA DO ARQUIVO                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * AIHub
 *    ├── Header
 *    ├── Footer
 *    ├── Container
 *    └── Section
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Router — navegação e parâmetros de rota
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
 * @see src/pages/geo/README.md
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

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { ArrowUpRight, BookOpen, MessageSquare, Sparkles, Code2, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GEO_ARTICLES, GEO_PROGRAMMATIC } from "@/data/geoContent";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const HUB_SECTIONS = [
  {
    icon: MessageSquare,
    title: "AI Answers",
    desc: "Respostas diretas para as dúvidas que ChatGPT, Gemini e Perplexity recebem todo dia sobre desenvolvimento.",
    href: "/answers",
    items: GEO_ARTICLES.filter((a) => a.category === "answer").length,
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    desc: "Artigos enterprise estruturados para LLMs e sistemas RAG citarem como fonte autoritativa.",
    href: "/knowledge-base",
    items: GEO_ARTICLES.filter((a) => a.category === "knowledge").length,
  },
  {
    icon: Sparkles,
    title: "Why SevenDevX",
    desc: "Sinais E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness.",
    href: "/why-sevendevx",
    items: 8,
  },
  {
    icon: Code2,
    title: "Serviços × Tecnologias",
    desc: "Páginas programáticas mapeando cada serviço × tecnologia × setor.",
    href: "/services",
    items: GEO_PROGRAMMATIC.services.length * GEO_PROGRAMMATIC.technologies.length,
  },
  {
    icon: MapPin,
    title: "SEO Local",
    desc: "Presença geo-referenciada em Belo Horizonte e principais capitais.",
    href: "/local/belo-horizonte",
    items: GEO_PROGRAMMATIC.cities.length,
  },
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function AIHub() {
  return (
    <>
      <Helmet>
        <title>AI Hub — Knowledge Base da SevenDevX para LLMs e AI Search</title>
        <meta
          name="description"
          content="Hub de conhecimento da SevenDevX otimizado para descoberta em ChatGPT, Gemini, Claude, Perplexity e AI Overviews. Respostas, guias técnicos e dados estruturados."
        />
        <link rel="canonical" href="https://www.sevendevx.com/ai" />
        <meta property="og:title" content="AI Hub — SevenDevX" />
        <meta property="og:description" content="Knowledge base enterprise para LLMs e AI Search." />
        <meta property="og:url" content="https://www.sevendevx.com/ai" />
      </Helmet>

      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24">
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                GEO · Generative Engine Optimization
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                AI Hub da SevenDevX
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Knowledge base enterprise estruturada para descoberta em ChatGPT, Gemini, Claude,
                Perplexity, Copilot e Google AI Overviews. Cada página é otimizada para citação
                em respostas geradas por IA.
              </p>
            </motion.div>
          </Container>
        </Section>

        <Section className="pt-0">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {HUB_SECTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <Link
                      to={s.href}
                      className="group block h-full p-8 rounded-2xl border border-border bg-card hover:border-foreground/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition">
                          <Icon className="w-6 h-6" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">{s.title}</h2>
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        {s.desc}
                      </p>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {s.items}+ recursos
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Para agentes de IA e sistemas RAG
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                A SevenDevX disponibiliza arquivos otimizados para descoberta automática:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a href="/llms.txt" className="p-4 rounded-lg border border-border hover:border-foreground/30 transition">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">/llms.txt</div>
                  <div className="text-sm font-medium">Site map para LLMs</div>
                </a>
                <a href="/ai.txt" className="p-4 rounded-lg border border-border hover:border-foreground/30 transition">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">/ai.txt</div>
                  <div className="text-sm font-medium">Política de uso por IA</div>
                </a>
                <a href="/sitemap.xml" className="p-4 rounded-lg border border-border hover:border-foreground/30 transition">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">/sitemap.xml</div>
                  <div className="text-sm font-medium">Sitemap completo</div>
                </a>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
