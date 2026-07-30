/**
 * FeaturedProjects.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/FeaturedProjects.tsx
 * @module UI
 *
 * @description
 * Vitrine dos projetos em destaque na home, com transições compartilhadas para a página de detalhe.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles, ExternalLink, Github, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidLiveUrl, type Project } from "@/data/projects";
import { usePrimaryProject, useSecondaryFeaturedProjects } from "@/hooks/useProjects";
import ProjectCard3D from "@/components/ProjectCard3D";
import { TechIconCDN } from "@/components/TechIconCDN";
import { TagIcon } from "@/components/TagIcon";
import { Button } from "@/components/ui/button";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useLanguage } from "@/i18n/LanguageContext";

// ============================================================================
// ⚙️ CONFIGURATION & BUSINESS RULES
// ============================================================================

/**
 * SOURCE OF TRUTH
 *
 * A vitrine é definida exclusivamente pela tabela `projects` no Supabase:
 *
 *   featured_level = "primary"    → hero da seção (um único projeto)
 *   featured_level = "secondary"  → cards complementares
 *
 * Não adicionar listas hardcoded neste componente: qualquer projeto exibido
 * aqui precisa existir no banco e estar publicado.
 *
 * DATA FLOW
 *
 * Supabase
 *    ↓
 * usePrimaryProject / useSecondaryFeaturedProjects
 *    ↓
 * FeaturedProjects
 *    ├── Hero Project
 *    └── Secondary Cards
 *           ↓
 *      FeaturedModal
 */

/**
 * Quantidade máxima de destaques secundários consultados.
 *
 * O limite existe para que a Home permaneça uma vitrine curada e não vire um
 * catálogo; a listagem integral continua em `/projects-hub`.
 */
const MAX_SECONDARY_PROJECTS = 4;

// ============================================================================
// 🪟 FEATURED PROJECT MODAL
// ============================================================================

/**
 * Contrato do modal de projeto destacado.
 */
interface FeaturedModalProps {
  /** Projeto atualmente selecionado. `null` mantém o modal fechado. */
  project: Project | null;

  /** Fecha o modal e devolve o usuário ao contexto da Home. */
  onClose: () => void;
}

/**
 * Exibe os detalhes completos de um projeto sem retirar o usuário da Home.
 *
 * @param project - Projeto selecionado; `null` não renderiza nada.
 * @param onClose - Fecha o modal e restaura a rolagem da página.
 *
 * @remarks
 * - `layoutId` é compartilhado com o card de origem, produzindo uma shared
 *   layout transition contínua via Framer Motion.
 * - Links externos interrompem a propagação do clique para não reabrir o modal.
 */
const FeaturedModal = ({ project, onClose }: FeaturedModalProps) => {
  const { t } = useLanguage();

  /**
   * Bloqueia o scroll do documento somente enquanto há projeto aberto, evitando
   * scroll concorrente entre a página e o conteúdo interno do modal. O hook
   * restaura o overflow original ao desmontar, para a página não ficar travada
   * após navegação.
   */
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
              {/* Estratégia de resolução do ícone de tecnologia:
                  1. `slug` → TechIconCDN (fonte preferencial, logo oficial);
                  2. `icon` legado → componente React de registros antigos;
                  3. ausência de ambos → renderiza somente o nome.
                  Não remover o fallback legado enquanto o catálogo de
                  tecnologias não estiver 100% migrado para `slug`. */}
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

// ============================================================================
// 🃏 SECONDARY FEATURED PROJECT CARD
// ============================================================================

/**
 * Contrato do card usado pelos destaques secundários.
 */
interface ProjectCardProps {
  /** Projeto representado pelo card. */
  project: Project;

  /** Posição na grade; usada apenas para escalonar a animação de entrada. */
  index: number;

  /** Promove o projeto ao modal expandido. */
  onOpen: (project: Project) => void;
}

/**
 * Card compacto dos projetos classificados como destaque secundário.
 *
 * @remarks
 * A memoização evita re-renderizar todos os cards quando apenas o estado do
 * modal da seção muda — as props de um card só se alteram quando o projeto
 * correspondente muda.
 */
const ProjectCard = memo(({ project, index, onOpen }: ProjectCardProps) => (
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
              /* O card inteiro abre o modal; sem stopPropagation o clique no
                 link externo abriria a nova aba e o modal ao mesmo tempo. */
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

// ============================================================================
// 🏗️ FEATURED PROJECTS SECTION
// ============================================================================

/**
 * Seção de portfólio da Home.
 *
 * @remarks
 * Orquestra hero + grade secundária + modal expandido. Enquanto o projeto
 * primário não estiver disponível (carregando ou nenhum publicado), a seção
 * inteira não é renderizada — preferimos ausência a um esqueleto vazio no
 * meio da narrativa da Home.
 */
const FeaturedProjects = () => {
  const navigate = useNavigate();

  /**
   * Projeto atualmente expandido no modal. `null` representa o estado fechado
   * e é o único controlador da visibilidade do `FeaturedModal`.
   */
  const [openProject, setOpenProject] = useState<Project | null>(null);

  // Ambos os hooks compartilham a mesma query React Query (`["projects"]`),
  // portanto não geram requisições adicionais ao Supabase.
  const { data: heroProject } = usePrimaryProject();
  const { data: secondaryProjects = [] } = useSecondaryFeaturedProjects(MAX_SECONDARY_PROJECTS);

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

        {/* ==========================================================================
            HERO PROJECT
            Vitrine comercial principal, controlada por featured_level="primary".
            ========================================================================== */}
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
                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary/80 border border-primary/20 bg-primary/5 px-2 py-1 rounded-sm">
                      <TagIcon name={tag} size={10} /> {tag}
                    </span>
                  ))}
                </div>
                {/* O card do hero abre o modal ao ser clicado; a barra de ações
                    interrompe a propagação para que o CTA externo não dispare
                    também a abertura do modal. */}
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

        {/* --------------------------------------------------------------------------
            SECONDARY PROJECT GRID
            Prévia limitada da curadoria; o portfólio completo permanece em
            /projects-hub. O `slice(0, 2)` mantém a grade em uma única linha na
            Home, mesmo que o banco tenha mais destaques secundários.
            -------------------------------------------------------------------------- */}
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
