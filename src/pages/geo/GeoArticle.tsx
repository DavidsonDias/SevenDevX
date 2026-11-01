/**
 * 🚀 GeoArticle.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/geo/GeoArticle.tsx
 * @module Public/GEO
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Índice e leitura de artigos GEO (respostas e base de
 * conhecimento).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `GeoArticleIndex`, `GeoArticlePage`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Aplica metadados SEO/GEO da rota
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🧩 ARQUITETURA DO ARQUIVO                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * GeoArticle
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

import { usePublicCopy } from "@/i18n/usePublicCopy";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { ArrowLeft, Clock, MessageCircleQuestion } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import NotFound from "@/pages/NotFound";
import { GEO_ARTICLES, type GeoArticle } from "@/data/geoContent";
import { resolveGeoArticle } from "@/i18n/editorial/resolve";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Props {
  basePath: "answers" | "knowledge-base";
  filterCategory: GeoArticle["category"];
  title: string;
  intro: string;
}

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

/**
 * Índice dos artigos GEO, agrupados por cluster de conteúdo.
 */
export function GeoArticleIndex({ basePath, filterCategory, title, intro }: Props) {
  const { copy, language } = usePublicCopy();
  const articles = GEO_ARTICLES.filter((a) => a.category === filterCategory).map(a => resolveGeoArticle(a, language).article);
  return (
    <>
      <Helmet>
        <title>{copy(title)} — SevenDevX</title>
        <meta name="description" content={copy(intro)} />
        <link rel="canonical" href={`https://www.sevendevx.com/${basePath}`} />
      </Helmet>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground pt-24">
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                {copy(basePath === "answers" ? "AI Answers" : "Knowledge Base")}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl">{copy(title)}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{copy(intro)}</p>
            </motion.div>
          </Container>
        </Section>
        <Section className="pt-0">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((a, i) => (
                <motion.div
                  key={a.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    to={`/${basePath}/${a.slug}`}
                    className="block h-full p-8 rounded-2xl border border-border bg-card hover:border-foreground/30 transition-all group"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      <Clock className="w-3 h-3" />
                      {a.readingMinutes} {copy("min de leitura")}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:underline">{a.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{a.shortAnswer}</p>
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

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Página de artigo GEO resolvida pelo slug da rota.
 */
export function GeoArticlePage({ basePath }: { basePath: "answers" | "knowledge-base" }) {
  const { copy, language } = usePublicCopy();
  const { slug } = useParams<{ slug: string }>();
  const sourceArticle = GEO_ARTICLES.find((a) => a.slug === slug);
  if (!sourceArticle) return <NotFound />;
  const canonicalBase = sourceArticle.category === "answer" ? "answers" : "knowledge-base";
  if (basePath !== canonicalBase) return <Navigate to={`/${canonicalBase}/${sourceArticle.slug}`} replace />;
  const { article, language: contentLanguage } = resolveGeoArticle(sourceArticle, language);
  const locale = contentLanguage === "pt" ? "pt-BR" : contentLanguage === "es" ? "es-ES" : "en-US";
  const url = `https://www.sevendevx.com/${basePath}/${article.slug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": basePath === "knowledge-base" ? "TechArticle" : "Article",
    headline: article.title,
    description: article.summary,
    author: { "@type": "Organization", name: "SevenDevX", url: "https://www.sevendevx.com" },
    publisher: { "@type": "Organization", name: "SevenDevX", logo: { "@type": "ImageObject", url: "https://www.sevendevx.com/logo-512.png" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: locale,
    keywords: article.keywords.join(", "),
    about: { "@type": "Thing", name: article.question },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.sevendevx.com/" },
      { "@type": "ListItem", position: 2, name: basePath === "answers" ? "AI Answers" : "Knowledge Base", item: `https://www.sevendevx.com/${basePath}` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  // Speakable (Google Assistant / AI voice answers)
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: { "@type": "SpeakableSpecification", cssSelector: [".geo-short-answer", "h1"] },
    url,
  };

  return (
    <>
      <Helmet>
        <title>{article.title} — SevenDevX</title>
        <meta name="description" content={article.summary} />
        <meta name="keywords" content={article.keywords.join(", ")} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content={locale.replace("-", "_")} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {article.faq.length > 0 && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(speakableSchema)}</script>
      </Helmet>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground pt-24 pb-16">
        <Container narrow>
          <Link to={`/${basePath}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8">
            <ArrowLeft className="w-4 h-4" /> {copy("Voltar")}
          </Link>

          <motion.article
            lang={locale}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              {copy(basePath === "answers" ? "AI Answer" : "Knowledge Base")} · {article.readingMinutes} {copy("min")}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Short answer block — optimized for featured snippets & AI Overviews */}
            <div className="geo-short-answer p-6 rounded-2xl border border-border bg-card mb-12">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                <MessageCircleQuestion className="w-4 h-4" />
                {copy("Resposta direta")}
              </div>
              <p className="text-lg leading-relaxed font-medium">{article.shortAnswer}</p>
            </div>

            <div className="prose prose-invert max-w-none space-y-10">
              {article.sections.map((sec) => (
                <section key={sec.heading}>
                  <h2 className="text-2xl font-bold tracking-tight mb-4">{sec.heading}</h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{sec.body}</div>
                </section>
              ))}

              {article.faq.length > 0 && <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6">{copy("Perguntas Frequentes")}</h2>
                <div className="space-y-4">
                  {article.faq.map((f) => (
                    <details key={f.q} className="group p-5 rounded-xl border border-border bg-card">
                      <summary className="cursor-pointer font-semibold list-none flex justify-between items-center">
                        <span>{f.q}</span>
                        <span className="text-muted-foreground group-open:rotate-45 transition">+</span>
                      </summary>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>}

              <p className="text-xs text-muted-foreground leading-relaxed" lang={language === "pt" ? "pt-BR" : language}>
                {copy("Valores e prazos são estimativas. Escopo, condições e entregas são definidos na proposta.")}
              </p>

              {article.relatedSlugs?.length ? (
                <section>
                  <h2 className="text-2xl font-bold tracking-tight mb-6">{copy("Conteúdo relacionado")}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {article.relatedSlugs.map((rs) => {
                      const related = GEO_ARTICLES.find((x) => x.slug === rs);
                      if (!related) return null;
                      const rel = resolveGeoArticle(related, language).article;
                      const path = rel.category === "answer" ? "answers" : "knowledge-base";
                      return (
                        <Link key={rs} to={`/${path}/${rs}`} className="block p-5 rounded-xl border border-border bg-card hover:border-foreground/30 transition">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            {copy(path === "answers" ? "AI Answer" : "Knowledge")}
                          </p>
                          <p className="font-semibold">{rel.title}</p>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          </motion.article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
