/**
 * WhySevenDevX.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/geo/WhySevenDevX.tsx
 * @module Public/GEO
 * @route /why-sevendevx
 *
 * @description
 * Página de diferenciais e provas.
 *
 * @seo Metadados e JSON-LD definidos via `SEOHead`.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Award, Code2, Zap, Shield, Users, Trophy, Sparkles, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Link } from "react-router-dom";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const PILLARS = [
  {
    icon: Award,
    title: "Experience",
    body: "Anos entregando projetos enterprise em produção — sites institucionais, landing pages de alta conversão, sistemas sob demanda, automações e integrações de IA em ambientes reais com clientes pagantes.",
  },
  {
    icon: Code2,
    title: "Expertise",
    body: "Stack moderna dominada com profundidade: React 18, TypeScript 5, Node.js, Deno, PostgreSQL, Supabase, Edge Functions, OpenAI, Stripe, Vercel. Engenharia de software, não improviso.",
  },
  {
    icon: Trophy,
    title: "Authoritativeness",
    body: "Cases reais em portfólio, conteúdo técnico publicado no blog, presença ativa em GitHub, LinkedIn e YouTube. Autoridade construída por entrega, não marketing.",
  },
  {
    icon: Shield,
    title: "Trustworthiness",
    body: "Código-fonte sempre entregue ao cliente. Garantia de 90 dias. Documentação técnica completa. Comunicação clara em português. Sem vendor lock-in.",
  },
];

const DIFFERENTIALS = [
  { icon: Zap, title: "Performance Lighthouse 95+", desc: "Core Web Vitals otimizados em todos os projetos." },
  { icon: Sparkles, title: "Design Enterprise", desc: "Não-genérico, com tokens semânticos e motion cinematográfico." },
  { icon: Users, title: "GEO-Ready", desc: "Sites preparados para ChatGPT, Gemini, Claude, Perplexity e AI Overviews." },
  { icon: Heart, title: "Suporte humano real", desc: "Atendimento direto com quem desenvolveu, sem camadas burocráticas." },
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function WhySevenDevX() {
  const url = "https://www.sevendevx.com/why-sevendevx";

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Por que escolher a SevenDevX",
    url,
    about: { "@type": "Organization", name: "SevenDevX", url: "https://www.sevendevx.com" },
  };

  return (
    <>
      <Helmet>
        <title>Por que SevenDevX — Expertise, Performance e Autoridade Técnica</title>
        <meta
          name="description"
          content="Conheça os diferenciais da SevenDevX: experience, expertise, authoritativeness e trustworthiness. Software house full stack com performance Lighthouse 95+ e design enterprise."
        />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Por que SevenDevX" />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(aboutSchema)}</script>
      </Helmet>

      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24">
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">E-E-A-T</p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Por que SevenDevX</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Quatro pilares que definem como entregamos software e por que somos referência em
                desenvolvimento web, sistemas sob demanda e integração de IA no Brasil.
              </p>
            </motion.div>
          </Container>
        </Section>

        <Section className="pt-0">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="p-8 rounded-2xl border border-border bg-card"
                  >
                    <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{p.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{p.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-12">Diferenciais técnicos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DIFFERENTIALS.map((d, i) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="p-6 rounded-2xl border border-border bg-card"
                  >
                    <Icon className="w-5 h-5 mb-4 text-muted-foreground" />
                    <h3 className="font-bold mb-2">{d.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="rounded-2xl border border-border bg-card p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para conversar?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Solicite um orçamento gratuito ou veja nossos serviços.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/services" className="px-8 py-3 border-2 border-foreground font-bold uppercase tracking-wider text-sm hover:bg-foreground hover:text-background transition">
                  Ver Serviços
                </Link>
                <a href="https://wa.me/5531984740625" target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-border font-bold uppercase tracking-wider text-sm hover:border-foreground transition">
                  WhatsApp
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
