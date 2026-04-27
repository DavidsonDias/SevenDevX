/**
 * 🔥 FeaturedProjects — SevenDevX Home Section (Enterprise)
 * Single source of truth: useProjects() (Supabase).
 * Hero = featured_level=primary | Secondary grid = featured_level=secondary (até 4)
 */

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles, ExternalLink, Github, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidLiveUrl, type Project } from "@/data/projects";
import { usePrimaryProject, useSecondaryFeaturedProjects } from "@/hooks/useProjects";
import ProjectCard3D from "@/components/ProjectCard3D";
import { TechIconCDN } from "@/components/TechIconCDN";
import { Button } from "@/components/ui/button";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Expanded Modal ── */
const FeaturedModal = ({ project, onClose }: { project: Project | null; onClose: () => void }) => {
  const { t } = useLanguage();
  useScrollLock(!!project);

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          layoutId={`featured-card-${project.id}`}
          className="relative z-50 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border/30 bg-card/90 backdrop-blur-xl">
            <h3 className="text-lg font-orbitron font-bold text-foreground">{project.title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="relative overflow-hidden rounded-xl">
              <img src={project.image} alt={project.title} className="w-full h-64 md:h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.longDescription || project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.techs.map(tech => {
                  const Icon = (tech as any).icon;
                  return (
                    <span key={tech.name} className="inline-flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full text-xs font-medium border border-border">
                      {tech.slug ? (
                        <TechIconCDN slug={tech.slug} name={tech.name} color={tech.color} size={14} />
                      ) : Icon ? (
                        <Icon className="text-base" style={{ color: tech.color }} />
                      ) : null}
                      <span>{tech.name}</span>
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-4">
                {isValidLiveUrl(project.liveUrl) && (
                  <Button size="sm" variant="default" className="flex-1" asChild>
                    <a href={project.liveUrl!} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t.projects.viewProject}
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      Código
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
};

/* ── Secondary Card ── */
const ProjectCard = memo(({ project, index, onOpen }: { project: Project; index: number; onOpen: (p: Project) => void }) => (
  <ProjectCard3D tiltIntensity={5} layoutId={`featured-card-${project.id}`}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-card cursor-pointer"
      onClick={() => onOpen(project)}
    >
      <img
        src={project.image}
        alt={project.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {project.techs.slice(0, 3).map(tech => (
            <span key={tech.name} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
              {tech.slug && <TechIconCDN slug={tech.slug} name={tech.name} color={tech.color} size={10} />}
              {tech.name}
            </span>
          ))}
        </div>
        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight mb-1">
          {project.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        <div className="flex gap-2 mt-3">
          {isValidLiveUrl(project.liveUrl) && (
            <a
              href={project.liveUrl!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-semibold border border-foreground/30 px-3 py-1.5 rounded-sm hover:bg-foreground hover:text-background transition-all"
            >
              Ver Projeto <ArrowUpRight size={12} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  </ProjectCard3D>
));
ProjectCard.displayName = "ProjectCard";

/* ── Main Section ── */
const FeaturedProjects = () => {
  const navigate = useNavigate();
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const { data: heroProject } = usePrimaryProject();
  const { data: secondaryProjects = [] } = useSecondaryFeaturedProjects(4);

  if (!heroProject) return null;

  return (
    <section className="relative bg-background py-20 md:py-28">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 md:mb-16"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-3">PORTFÓLIO</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-4">
            Projetos em Destaque
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Soluções reais desenvolvidas com foco em performance, design e resultado
          </p>
        </motion.div>

        {/* Hero Project (primary) */}
        <ProjectCard3D tiltIntensity={4} className="mb-6" layoutId={`featured-card-${heroProject.id}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group relative overflow-hidden rounded-xl border border-primary/20 bg-card cursor-pointer"
            onClick={() => setOpenProject(heroProject)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-video lg:aspect-auto">
                <img
                  src={heroProject.image}
                  alt={heroProject.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60 hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent lg:hidden" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-medium uppercase tracking-wider">
                    <Sparkles size={10} /> Destaque Principal
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight mb-3">
                  {heroProject.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                  {heroProject.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {heroProject.techs.map(tech => (
                    <span key={tech.name} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-1 rounded-sm">
                      {tech.slug && <TechIconCDN slug={tech.slug} name={tech.name} color={tech.color} size={12} />}
                      {tech.name}
                    </span>
                  ))}
                  {heroProject.tags?.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider text-primary/80 border border-primary/20 bg-primary/5 px-2 py-1 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                  {isValidLiveUrl(heroProject.liveUrl) && (
                    <a
                      href={heroProject.liveUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border-2 border-foreground px-6 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300"
                    >
                      Ver Projeto <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </ProjectCard3D>

        {/* Secondary Projects */}
        {secondaryProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12">
            {secondaryProjects.slice(0, 2).map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onOpen={setOpenProject} />
            ))}
          </div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <motion.button
            onClick={() => navigate("/projects-hub")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-2 border-2 border-foreground px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Ver todos os projetos
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      <FeaturedModal project={openProject} onClose={() => setOpenProject(null)} />
    </section>
  );
};

export default FeaturedProjects;
