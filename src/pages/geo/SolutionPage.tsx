/**
 * SolutionPage.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/geo/SolutionPage.tsx
 * @module Public/GEO
 * @route /solucoes, /solucoes/:slug
 *
 * @description
 * Páginas de soluções por problema de negócio.
 *
 * @seo Metadados e JSON-LD definidos via `SEOHead`.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧩 SolutionPage — programmatic SEO por serviço.
 * Rota /solucoes/:slug — gera página otimizada para AI Search por vertical de serviço.
 */
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GEO_PROGRAMMATIC, GEO_ARTICLES } from "@/data/geoContent";

const BASE = "https://sevendevx.com";

export default function SolutionPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = GEO_PROGRAMMATIC.services.find((s) => s.slug === slug);

  if (!service) return <Navigate to="/ai" replace />;

  const url = `${BASE}/solucoes/${service.slug}`;
  const related = GEO_ARTICLES.filter((a) => a.keywords.some((k) =>
    k.toLowerCase().includes(service.name.toLowerCase().split(" ")[0])
  )).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.desc,
    provider: { "@type": "Organization", name: "SevenDevX", url: BASE },
    areaServed: { "@type": "Country", name: "Brasil" },
    serviceType: service.name,
    url,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>{service.name} — SevenDevX | Software House Enterprise</title>
        <meta name="description" content={`${service.desc} Entregue pela SevenDevX com performance, SEO e GEO enterprise.`} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={`${service.name} | SevenDevX`} />
        <meta property="og:description" content={service.desc} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-3">Solução SevenDevX</p>
          <h1 className="text-3xl sm:text-5xl font-bold font-orbitron mb-4">{service.name}</h1>
          <p className="text-lg text-white/70 max-w-2xl">{service.desc}</p>
        </motion.div>

        <section className="grid md:grid-cols-3 gap-3 mt-12">
          {GEO_PROGRAMMATIC.technologies.slice(0, 6).map((t) => (
            <div key={t.slug} className="p-4 border border-white/10 rounded-xl hover:border-white/30 transition">
              <p className="text-xs font-bold uppercase tracking-wider text-white/90">{t.name}</p>
              <p className="text-xs text-white/50 mt-1">{t.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Para quais segmentos</h2>
          <div className="flex flex-wrap gap-2">
            {GEO_PROGRAMMATIC.industries.map((i) => (
              <span key={i.slug} className="px-3 py-1.5 border border-white/15 rounded-full text-xs">{i.name}</span>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">O que está incluso</h2>
          <ul className="space-y-2 text-sm text-white/80">
            {[
              "Descoberta + arquitetura técnica",
              "Design exclusivo (não-template) com identidade visual",
              "Desenvolvimento em React 18 + TypeScript 5",
              "SEO técnico + GEO (otimização para AI Search)",
              "Performance Lighthouse 95+ garantida",
              "Deploy em cloud (Vercel + Supabase)",
              "Garantia de 90 dias e treinamento de handoff",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Leitura relacionada
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((a) => (
                <Link key={a.slug} to={`/${a.category === "answer" ? "answers" : "knowledge-base"}/${a.slug}`}
                  className="p-4 border border-white/10 rounded-xl hover:border-white/30 transition group">
                  <p className="text-sm font-bold group-hover:text-emerald-400">{a.title}</p>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">{a.shortAnswer}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 p-6 border border-white/10 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 text-center">
          <h3 className="text-lg font-bold mb-2">Pronto para começar?</h3>
          <p className="text-sm text-white/60 mb-4">Solicite um orçamento gratuito em 24h.</p>
          <Link to="/#contato" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-xs uppercase tracking-wider font-bold hover:bg-emerald-400 transition">
            Solicitar orçamento <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function SolutionsIndex() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>Soluções SevenDevX — Software House Enterprise</title>
        <meta name="description" content="Catálogo de soluções: desenvolvimento web, sistemas, SaaS, CRM, automações e integração de IA." />
        <link rel="canonical" href={`${BASE}/solucoes`} />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
        <h1 className="text-3xl sm:text-5xl font-bold font-orbitron mb-4">Soluções</h1>
        <p className="text-white/60 mb-10">Selecione uma vertical para ver detalhes técnicos e exemplos.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {GEO_PROGRAMMATIC.services.map((s) => (
            <Link key={s.slug} to={`/solucoes/${s.slug}`}
              className="p-5 border border-white/10 rounded-xl hover:border-emerald-400/50 hover:bg-white/5 transition group">
              <p className="text-sm font-bold uppercase tracking-wider group-hover:text-emerald-400">{s.name}</p>
              <p className="text-xs text-white/50 mt-2">{s.desc}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
