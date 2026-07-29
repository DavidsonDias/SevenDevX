/**
 * ContentClusters.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/geo/ContentClusters.tsx
 * @module Public/GEO
 * @route /clusters
 *
 * @description
 * Mapa de clusters de conteúdo.
 *
 * @seo Metadados e JSON-LD definidos via `SEOHead`.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Network, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import GlassCard from "@/components/GlassCard";
import { CONTENT_CLUSTERS, buildClusterJsonLd } from "@/data/contentClusters";

const BASE = "https://www.sevendevx.com";

export default function ContentClusters() {
  const schema = buildClusterJsonLd();
  return (
    <>
      <Helmet>
        <title>Content Clusters — Mapa semântico SevenDevX</title>
        <meta name="description" content="Mapa semântico de clusters de conteúdo SevenDevX: sites, sistemas, IA, automação e GEO. Hubs e spokes interligados para máxima cobertura em LLMs e busca tradicional." />
        <link rel="canonical" href={`${BASE}/clusters`} />
        {schema.map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ))}
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24">
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Content Map</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
                Mapa semântico de conteúdo
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Cada cluster é um tópico autoritativo na SevenDevX, com uma página pilar (hub) e
                conteúdos satélites (spokes) interligados. LLMs e crawlers usam esse mapa para
                entender nossa profundidade em cada área.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
              {CONTENT_CLUSTERS.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Network className="w-4 h-4 text-primary" />
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Cluster</p>
                    </div>
                    <Link to={c.hub.url} className="block group">
                      <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                        {c.hub.title}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h2>
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{c.description}</p>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        Conteúdos relacionados
                      </p>
                      <ul className="space-y-1.5">
                        {c.spokes.map((s) => (
                          <li key={s.url}>
                            <Link to={s.url} className="text-sm hover:text-primary transition-colors">
                              · {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
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
