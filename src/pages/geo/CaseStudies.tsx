/**
 * CaseStudies.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/geo/CaseStudies.tsx
 * @module Public/GEO
 * @route /cases, /cases/:slug
 *
 * @description
 * Índice e detalhe de estudos de caso.
 *
 * @seo Metadados e JSON-LD definidos via `SEOHead`.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { ArrowLeft, TrendingUp, Clock, Zap, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import GlassCard from "@/components/GlassCard";
import NotFound from "@/pages/NotFound";
import { CASE_STUDIES, getCaseStudyBySlug } from "@/data/caseStudies";

const BASE = "https://www.sevendevx.com";

export function CaseStudiesIndex() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cases SevenDevX",
    itemListElement: CASE_STUDIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/cases/${c.slug}`,
      name: c.title,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Cases — Projetos reais entregues pela SevenDevX</title>
        <meta name="description" content="Cases reais de desenvolvimento web, SaaS, sistemas e integrações IA entregues pela SevenDevX. Problema, solução, resultado e tecnologias de cada projeto." />
        <link rel="canonical" href={`${BASE}/cases`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24">
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Case Studies</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
                Projetos reais. Resultados mensuráveis.
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Cada case abaixo mostra o problema original do cliente, a solução técnica que entregamos
                e os números reais do impacto. Tecnologias, prazos e arquitetura totalmente transparentes.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
              {CASE_STUDIES.map((c, i) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/cases/${c.slug}`} className="block group">
                    <GlassCard className="p-6 h-full hover:border-primary/40 transition-colors">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        {c.industry} · {c.duration}
                      </p>
                      <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        {c.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {c.summary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {c.metrics.slice(0, 3).map((m) => (
                          <span key={m.label} className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5">
                            <strong>{m.value}</strong> · {m.label}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const c = slug ? getCaseStudyBySlug(slug) : undefined;
  if (!c) return <NotFound />;

  const caseSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.summary,
    datePublished: c.publishedAt,
    author: { "@type": "Organization", name: "SevenDevX", url: BASE },
    publisher: { "@type": "Organization", name: "SevenDevX", logo: { "@type": "ImageObject", url: `${BASE}/logo-512.png` } },
    about: c.technologies.map((t) => ({ "@type": "Thing", name: t })),
    mainEntityOfPage: `${BASE}/cases/${c.slug}`,
  };

  return (
    <>
      <Helmet>
        <title>{c.title} — Case SevenDevX</title>
        <meta name="description" content={c.summary} />
        <link rel="canonical" href={`${BASE}/cases/${c.slug}`} />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.summary} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(caseSchema)}</script>
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24">
        <Section>
          <Container>
            <Link to="/cases" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Todos os cases
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                {c.client} · {c.industry}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 max-w-4xl">{c.title}</h1>
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">{c.summary}</p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-3 mt-10">
              {c.metrics.map((m) => (
                <GlassCard key={m.label} className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </GlassCard>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold">Problema</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.problem}</p>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold">Solução</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.solution}</p>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold">Resultado</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.outcome}</p>
              </GlassCard>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-3">Stack utilizada</h3>
                <div className="flex flex-wrap gap-2">
                  {c.technologies.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/5">{t}</span>
                  ))}
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-3">Serviços envolvidos</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {c.services.map((s) => <li key={s}>· {s}</li>)}
                </ul>
              </GlassCard>
            </div>

            {c.liveUrl && (
              <div className="mt-12 text-center">
                <a
                  href={c.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Ver projeto ao vivo <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
