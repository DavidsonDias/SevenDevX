/**
 * ProjectDetail.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/ProjectDetail.tsx
 * @module Public
 * @route /projects/:slug
 *
 * @description
 * Detalhe de projeto com transição compartilhada a partir dos cards.
 *
 * @see src/pages/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🌐 ProjectDetail — /projects/:slug
 * Public project case-study page with full SEO + JSON-LD CreativeWork schema.
 */

import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github, Sparkles } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectBySlug } from "@/hooks/useProjects";
import { isValidLiveUrl } from "@/data/projects";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import { TechIconCDN } from "@/components/TechIconCDN";
import { TagIcon } from "@/components/TagIcon";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProjectBySlug(slug);

  useEffect(() => {
    if (!isLoading && (error || project === null)) {
      // Soft redirect to projects hub after 1.5s
      const t = setTimeout(() => navigate("/projects-hub", { replace: true }), 1500);
      return () => clearTimeout(t);
    }
  }, [isLoading, error, project, navigate]);

  if (isLoading) return <AppLoaderOrbital />;

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-6">
        <div>
          <p className="text-muted-foreground mb-4">Projeto não encontrado.</p>
          <Button onClick={() => navigate("/projects-hub")} variant="outline">
            Ver todos os projetos
          </Button>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://www.sevendevx.com/projects/${slug}`;
  const seoTitle = `${project.title} — Projeto SevenDevX | Case de Desenvolvimento`;
  const seoDescription =
    project.longDescription?.slice(0, 158) || project.description.slice(0, 158);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: project.image,
    url: canonicalUrl,
    author: {
      "@type": "Organization",
      name: "SevenDevX",
      url: "https://www.sevendevx.com",
    },
    keywords: [
      ...(project.tags || []),
      ...(project.techs?.map((t) => t.name) || []),
    ].join(", "),
  };

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={[...(project.tags || []), ...(project.techs?.map((t) => t.name) || []), "SevenDevX"].join(", ")}
        url={canonicalUrl}
        image={project.image}
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28 border-b border-border/30">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-40" />

            <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/projects-hub")}
                  className="mb-6 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos projetos
                </Button>

                <div className="grid lg:grid-cols-2 gap-10 items-center">
                  <div className="space-y-5">
                    {project.featured && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 border border-primary/30 rounded-full text-[11px] font-medium text-primary uppercase tracking-wider">
                        <Sparkles size={11} /> Projeto em destaque
                      </span>
                    )}
                    <h1 className="text-[clamp(1.8rem,5vw,3.5rem)] font-orbitron font-bold tracking-tight leading-tight">
                      {project.title}
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.tags?.map((t) => (
                        <Badge key={t} variant="secondary" className="inline-flex items-center gap-1 text-[11px]">
                          <TagIcon name={t} size={12} /> {t}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4">
                      {isValidLiveUrl(project.liveUrl) && (
                        <Button asChild size="lg">
                          <a href={project.liveUrl!} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver projeto ao vivo
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button asChild size="lg" variant="outline">
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            Repositório
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/40 shadow-2xl shadow-primary/10"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Content */}
          {project.longDescription && (
            <section className="py-16 sm:py-20">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                  Sobre o projeto
                </h2>
                <p className="text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
                  {project.longDescription}
                </p>
              </div>
            </section>
          )}

          {/* Tech stack */}
          {project.techs?.length > 0 && (
            <section className="py-12 border-t border-border/30">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
                  Stack utilizada
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.techs.map((tech) => {
                    const Icon = tech.icon;
                    return (
                      <div
                        key={tech.name}
                        className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full border border-border"
                      >
                        {tech.slug ? (
                          <TechIconCDN slug={tech.slug} name={tech.name} color={tech.color} size={18} />
                        ) : (
                          <Icon className="text-base" style={{ color: tech.color }} />
                        )}
                        <span className="text-sm font-medium">{tech.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="py-20 border-t border-border/30 text-center">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Quer um projeto como esse?
              </h2>
              <p className="text-muted-foreground">
                Conte sua ideia e construímos uma solução sob medida para o seu negócio.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button asChild size="lg">
                  <Link to="/#contact">Solicitar orçamento</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/projects-hub">Ver todos os projetos</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </>
  );
};

export default ProjectDetail;
