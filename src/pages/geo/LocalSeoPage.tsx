/**
 * 🚀 LocalSeoPage.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/geo/LocalSeoPage.tsx
 * @module Public/GEO
 * @route /knowledge-base/:slug
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Página local por cidade, com sinais geográficos estruturados.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `LocalSeoPage`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Aplica metadados SEO/GEO da rota
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🧩 ARQUITETURA DO ARQUIVO                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * LocalSeoPage
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
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import NotFound from "@/pages/NotFound";
import { GEO_PROGRAMMATIC } from "@/data/geoContent";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function LocalSeoPage() {
  const { copy, message, language } = usePublicCopy();
  const { city } = useParams<{ city: string }>();
  const cityData = GEO_PROGRAMMATIC.cities.find((c) => c.slug === city);
  if (!cityData) return <NotFound />;

  const url = `https://www.sevendevx.com/local/${cityData.slug}`;
  const title = `${message("Desenvolvimento Web em {city}", { city: cityData.name })} — SevenDevX`;
  const descriptions = {
    pt: `Criação de sites, landing pages e sistemas sob demanda em ${cityData.name}/${cityData.state}. Software house full stack com performance Lighthouse 95+ e design enterprise.`,
    en: `Websites, landing pages and custom systems in ${cityData.name}/${cityData.state}, Brazil. Full-stack software development with Lighthouse 95+ performance and enterprise design.`,
    es: `Sitios web, landing pages y sistemas a medida en ${cityData.name}/${cityData.state}, Brasil. Desarrollo full stack con rendimiento Lighthouse 95+ y diseño empresarial.`,
  };
  const description = descriptions[language];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: title,
    image: "https://www.sevendevx.com/logo-512.png",
    url,
    telephone: "+55-31-98474-0625",
    email: "contato@sevendevx.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: cityData.name,
      addressRegion: cityData.state,
      addressCountry: "BR",
    },
    areaServed: { "@type": "City", name: cityData.name },
    priceRange: "$$",
    provider: { "@type": "Organization", name: "SevenDevX", url: "https://www.sevendevx.com" },
  };

  return (
    <>
      <Helmet>
        <title>{copy(title)}</title>
        <meta name="description" content={copy(description)} />
        <link rel="canonical" href={url} />
        <meta name="geo.region" content={`BR-${cityData.state}`} />
        <meta name="geo.placename" content={cityData.name} />
        <meta property="og:title" content={copy(title)} />
        <meta property="og:description" content={copy(description)} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24">
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                <MapPin className="w-3 h-3" /> {copy(cityData.name)} · {cityData.state}
              </p>
              <h1 className="text-[clamp(1.5rem,4.5vw,3.75rem)] break-words font-bold tracking-tight mb-6 max-w-3xl">
                {copy("Desenvolvimento Web em")} {copy(cityData.name)}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {message("A SevenDevX atende empresas em {city}/{state} com criação de sites, landing pages, sistemas sob demanda, automações e integração de IA. Stack moderna, performance Lighthouse 95+ e design enterprise.", { city: cityData.name, state: cityData.state })}
              </p>
            </motion.div>
          </Container>
        </Section>

        <Section className="pt-0">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GEO_PROGRAMMATIC.services.map((s, i) => (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="p-6 rounded-2xl border border-border bg-card"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-3" />
                  <h2 className="font-bold text-lg mb-1">{message("{service} em {city}", { service: copy(s.name), city: cityData.name })}</h2>
                  <p className="text-sm text-muted-foreground">{copy(s.desc)}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{copy("Fale com a SevenDevX")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <a href="https://wa.me/5531984740625" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-foreground/30 transition">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{copy("WhatsApp")}</p>
                    <p className="font-medium">+55 (31) 98474-0625</p>
                  </div>
                </a>
                <a href="mailto:contato@sevendevx.com" className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-foreground/30 transition">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{copy("Email")}</p>
                    <p className="font-medium">contato@sevendevx.com</p>
                  </div>
                </a>
                <Link to="/services" className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-foreground/30 transition">
                  <CheckCircle2 className="w-5 h-5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{copy("Catálogo")}</p>
                    <p className="font-medium">{copy("Ver todos os serviços")}</p>
                  </div>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  {copy("Outras cidades atendidas")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {GEO_PROGRAMMATIC.cities.filter((c) => c.slug !== cityData.slug).map((c) => (
                    <Link key={c.slug} to={`/local/${c.slug}`} className="px-3 py-1.5 rounded-full border border-border text-sm hover:border-foreground/30 transition">
                      {copy(c.name)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
