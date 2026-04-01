/**
 * 🔥 FeaturedProjects — SevenDevX Home Section
 * Showcases top projects with hero + secondary layout
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { projects, isValidLiveUrl, type Project } from "@/data/projects";
import ProjectCard3D from "@/components/ProjectCard3D";

const FEATURED_IDS = [101, 102, 103]; // PsicoOne, Barbearia, Psicóloga Roane

const featuredProjects = FEATURED_IDS
  .map(id => projects.find(p => p.id === id))
  .filter(Boolean) as Project[];

const heroProject = featuredProjects[0];
const secondaryProjects = featuredProjects.slice(1);

const ProjectCard = memo(({ project, index }: { project: Project; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.1 * index }}
    whileHover={{ scale: 1.02 }}
    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-card cursor-pointer"
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
          <span key={tech.name} className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
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
));
ProjectCard.displayName = "ProjectCard";

const FeaturedProjects = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background py-20 md:py-28">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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

        {/* Hero Project (PsicoOne) */}
        {heroProject && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ scale: 1.01 }}
            className="group relative overflow-hidden rounded-xl border border-primary/20 bg-card mb-6 cursor-pointer"
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
                    <span key={tech.name} className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-1 rounded-sm">
                      {tech.name}
                    </span>
                  ))}
                  {heroProject.tags?.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider text-primary/80 border border-primary/20 bg-primary/5 px-2 py-1 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
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
        )}

        {/* Secondary Projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12">
          {secondaryProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

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
    </section>
  );
};

export default FeaturedProjects;
