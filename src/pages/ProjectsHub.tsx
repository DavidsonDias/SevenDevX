/**
 * 🚀 ProjectsHub.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/ProjectsHub.tsx
 * @module Public
 * @route /projects-hub
 * @layer Presentation / Public
 * @status Active
 *
 * @description
 * Hub de navegação entre projetos e clusters relacionados.
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
 * ProjectsHub
 *    ├── Header
 *    ├── Footer
 *    ├── WhatsAppButton
 *    ├── SEOHead
 *    ├── Badge
 *    ├── Button
 *    ├── Card
 *    ├── CardContent
 *    ├── ProjectCard3D
 *    └── AppLoaderOrbital
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

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Sparkles, ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { isValidLiveUrl, type Project } from "@/data/projects";
import { useProjects, type UIProject } from "@/hooks/useProjects";
import ProjectCard3D from "@/components/ProjectCard3D";
import { useScrollLock } from "@/hooks/useScrollLock";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import { TechIconCDN } from "@/components/TechIconCDN";
import { TagIcon } from "@/components/TagIcon";

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

// ─── Project Modal with layoutId ───
const ProjectModal = memo(({ project, onClose, isPrimary, isFeatured }: {
  project: Project | null;
  onClose: () => void;
  isPrimary?: boolean;
  isFeatured?: boolean;
}) => {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useScrollLock(!!project);

  useEffect(() => {
    if (!project) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;
        const focusables = Array.from(
          modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => modalRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          layoutId={`hub-card-${project.id}`}
          className="relative z-50 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border/30 sticky top-0 bg-card/90 backdrop-blur-xl z-10">
            <h3 className="text-lg font-orbitron font-semibold text-foreground">{project.title}</h3>
            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="p-2 hover:bg-muted/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="relative h-64 md:h-full overflow-hidden rounded-xl">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {(isFeatured || isPrimary) && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-primary/90 rounded-full text-xs font-semibold text-primary-foreground">
                  <Sparkles className="w-3 h-3" /> {isPrimary ? t.projectsHub.mainFeatured : t.projectsHub.featured}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-sm">
                {project.longDescription || project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.techs.map((tech) => {
                  const Icon = tech.icon;
                  return (
                    <div key={tech.name} className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border">
                      {tech.slug ? (
                        <TechIconCDN slug={tech.slug} name={tech.name} color={tech.color} size={16} />
                      ) : (
                        <Icon className="text-base" style={{ color: tech.color }} />
                      )}
                      <span className="text-xs font-medium uppercase">{tech.name}</span>
                    </div>
                  );
                })}
              </div>
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5">
                      <TagIcon name={tag} size={11} /> {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                {isValidLiveUrl(project.liveUrl) ? (
                  <Button size="sm" variant="default" className="flex-1" asChild>
                    <a href={project.liveUrl!} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t.projects.viewProject}
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="flex-1 opacity-60" disabled>
                    {t.projects.noDemo}
                  </Button>
                )}
                {project.githubUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      {t.projects.viewCode}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
ProjectModal.displayName = "ProjectModal";

// ─── Project Card ───
const ProjectCard = memo(({ project, index, isFeatured, isHero, onOpenModal }: {
  project: UIProject;
  index: number;
  isFeatured: boolean;
  isHero: boolean;
  onOpenModal: (p: UIProject) => void;
}) => {
  const { t } = useLanguage();

  if (isHero) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="col-span-1 sm:col-span-2 lg:col-span-3"
      >
        <ProjectCard3D tiltIntensity={4} layoutId={`hub-card-${project.id}`}>
          <Card
            className="group relative overflow-hidden border border-primary/30 bg-card/60 backdrop-blur-md rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20"
            onClick={() => onOpenModal(project)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 sm:h-72 md:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-4 py-1.5 bg-primary rounded-full text-xs font-bold text-primary-foreground z-10 shadow-lg shadow-primary/40">
                  <Sparkles className="w-3.5 h-3.5" /> {t.projectsHub.mainFeatured}
                </div>
                {project.tags && project.tags.length > 0 && (
                  <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[11px] font-medium text-foreground/90 border border-border/30">
                        <TagIcon name={tag} size={11} className="mr-1" />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <CardContent className="p-6 sm:p-8 flex flex-col justify-center space-y-4">
                <h3 className="font-orbitron font-bold text-2xl sm:text-3xl text-foreground group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {project.longDescription || project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techs.map((tech) => {
                    const Icon = tech.icon;
                    return (
                      <div key={tech.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/20 rounded-full border border-border text-xs">
                        {tech.slug ? (
                          <TechIconCDN slug={tech.slug} name={tech.name} color={tech.color} size={14} />
                        ) : (
                          <Icon className="text-sm" style={{ color: tech.color }} />
                        )}
                        <span className="font-medium text-foreground">{tech.name}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                  {isValidLiveUrl(project.liveUrl) && (
                    <Button size="default" variant="default" className="shadow-lg shadow-primary/20" asChild>
                      <a href={project.liveUrl!} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t.projects.viewProject}
                      </a>
                    </Button>
                  )}
                  <Button size="default" variant="outline" onClick={() => onOpenModal(project)}>
                    {t.common.learnMore}
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </ProjectCard3D>
      </motion.div>
    );
  }

  return (
    <ProjectCard3D tiltIntensity={5} layoutId={`hub-card-${project.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.36), ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Card
          className={cn(
            "group relative overflow-hidden border bg-card/60 backdrop-blur-md rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl h-full",
            isFeatured
              ? "border-primary/20 hover:border-primary/40 hover:shadow-primary/15"
              : "border-border/50 hover:border-border hover:shadow-primary/5"
          )}
          onClick={() => onOpenModal(project)}
        >
          <div className="relative overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isFeatured ? "h-52 sm:h-60" : "h-48 sm:h-52"}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-4 py-2 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium backdrop-blur-sm">
                {t.common.learnMore}
              </span>
            </div>

            {isFeatured && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-primary/90 rounded-full text-xs font-semibold text-primary-foreground z-10">
                <Sparkles className="w-3 h-3" /> {t.projectsHub.featured}
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                {project.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full text-[10px] font-medium text-foreground/80 border border-border/30">
                    <TagIcon name={tag} size={10} className="mr-1" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div>
              <h3 className="font-orbitron font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed line-clamp-2">
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {project.techs.map((tech) => {
                const Icon = tech.icon;
                return (
                  <div key={tech.name} className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-muted/20 rounded-full border border-border text-xs">
                    {tech.slug ? (
                      <TechIconCDN slug={tech.slug} name={tech.name} color={tech.color} size={14} />
                    ) : (
                      <Icon className="text-sm" style={{ color: tech.color }} />
                    )}
                    <span className="font-medium text-foreground">{tech.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              {isValidLiveUrl(project.liveUrl) && (
                <Button size="sm" variant="default" className="flex-1" asChild>
                  <a href={project.liveUrl!} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    {t.projects.viewProject}
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                variant={isValidLiveUrl(project.liveUrl) ? "outline" : "default"}
                className="flex-1"
                onClick={() => onOpenModal(project)}
              >
                {t.common.learnMore}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </ProjectCard3D>
  );
});
ProjectCard.displayName = "ProjectCard";

// ─── Page ───
const FILTER_TAGS = ["React", "TypeScript", "Node.js", "SaaS", "3D", "AI", "PWA"];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const ProjectsHub = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [openProject, setOpenProject] = useState<UIProject | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useAnalytics();

  const { data: projects = [], isLoading } = useProjects();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFilter = useCallback((tag: string) => {
    setSelectedFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    window.scrollTo({ top: document.getElementById("projects-grid")?.offsetTop ?? 400, behavior: "smooth" });
  }, []);

  const clearFilters = useCallback(() => setSelectedFilters([]), []);

  const filtered = useMemo(() => {
    if (selectedFilters.length === 0) return projects;
    return projects.filter((p) => {
      const allTags = [...p.techs.map((t) => t.name), ...(p.tags || [])];
      return selectedFilters.some((f) => allTags.includes(f));
    });
  }, [projects, selectedFilters]);

  const heroProject = projects.find((p) => p.featuredLevel === "primary");
  const featuredCount = projects.filter((p) => p.featuredLevel !== "none").length;

  const handleOpenModal = useCallback((project: UIProject) => {
    setOpenProject(project);
  }, []);

  if (isLoading) return <AppLoaderOrbital />;

  return (
    <>
      <SEOHead
        title="Todos os Projetos | SevenDevX — Portfólio Completo de Software"
        description="Explore todos os projetos da SevenDevX: SaaS, landing pages de alta conversão, dashboards, simuladores 3D e aplicações web modernas. Soluções reais com tecnologia enterprise."
        keywords="portfólio completo, projetos software, SaaS, landing page alta conversão, dashboard web, desenvolvimento web enterprise, React, TypeScript, Node.js, aplicações web modernas, SevenDevX"
        url="https://www.sevendevx.com/projects-hub"
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative overflow-hidden py-20 sm:py-24 md:py-32 lg:py-40">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />

            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center space-y-5 sm:space-y-6"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.projectsHub.backButton}
                </Button>

                <h1 className="text-[clamp(1.8rem,5vw,4.5rem)] font-orbitron font-bold tracking-tight">
                  {t.projectsHub.heroTitle}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t.projectsHub.heroSubtitle}
                </p>

                <div className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    {projects.length} {t.projectsHub.projects}
                  </span>
                  <span>•</span>
                  <span>{featuredCount} {t.projectsHub.highlights}</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Filters */}
          <div
            className={`sticky top-0 z-40 border-b transition-all duration-300 ${
              scrolled
                ? "bg-background/90 backdrop-blur-xl shadow-lg shadow-black/10 border-border/50"
                : "bg-background/60 backdrop-blur-lg border-transparent"
            }`}
          >
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
                <Badge
                  variant={selectedFilters.length === 0 ? "default" : "outline"}
                  className={`cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0 ${
                    selectedFilters.length === 0
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "border-border hover:bg-muted/30 hover:border-primary/50"
                  }`}
                  onClick={clearFilters}
                >
                  {t.common.viewAll}
                </Badge>

                {FILTER_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedFilters.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0 ${
                      selectedFilters.includes(tag)
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "border-border hover:bg-muted/30 hover:border-primary/50"
                    }`}
                    onClick={() => toggleFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}

                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 pl-2">
                  {filtered.length} {t.projectsHub.projects}
                </span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <section id="projects-grid" className="py-10 sm:py-16 md:py-24">
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20 text-muted-foreground"
                  >
                    <p className="text-lg">{t.projects.noResults}</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      {t.projectsHub.clearFilters}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedFilters.join(",")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
                  >
                    {filtered.map((project, index) => (
                      <ProjectCard
                        key={project.dbId}
                        project={project}
                        index={index}
                        isFeatured={project.featuredLevel !== "none"}
                        isHero={
                          selectedFilters.length === 0 &&
                          !!heroProject &&
                          project.dbId === heroProject.dbId
                        }
                        onOpenModal={handleOpenModal}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />

        {/* JSON-LD: ItemList of projects */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "SevenDevX Projects",
              itemListElement: projects.slice(0, 10).map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "SoftwareApplication",
                  name: p.title,
                  description: p.description,
                  applicationCategory: "WebApplication",
                  operatingSystem: "Web",
                  url: `https://www.sevendevx.com/projects/${p.slug}`,
                  author: {
                    "@type": "Organization",
                    name: "SevenDevX",
                    url: "https://www.sevendevx.com",
                  },
                },
              })),
            }),
          }}
        />
      </div>

      <ProjectModal
        project={openProject}
        onClose={() => setOpenProject(null)}
        isPrimary={openProject?.featuredLevel === "primary"}
        isFeatured={openProject?.featuredLevel === "secondary"}
      />
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default ProjectsHub;
