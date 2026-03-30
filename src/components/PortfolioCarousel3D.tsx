/**
 * 🔥 PortfolioCarousel3D — SevenDevX
 * -------------------------------------------------------------
 * Carrossel 3D com swipe horizontal mobile-first
 * 
 * EFEITOS VISUAIS:
 * ✅ perspective + rotateY + scale + translateX
 * ✅ z-index dinâmico
 * ✅ Transições spring suaves
 * ✅ Cards laterais com opacidade e escala reduzidas
 * 
 * MOBILE-FIRST:
 * ✅ Swipe touch nativo
 * ✅ Snap suave entre cards
 * ✅ Indicador de posição (dots)
 * 
 * DESKTOP:
 * ✅ Mouse drag + trackpad
 * ✅ Keyboard navigation
 * ✅ Hover effects
 * -------------------------------------------------------------
 */

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, PanInfo, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Github, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { projects, isValidLiveUrl, type Project } from "@/data/projects";

// ---------------------------------------------------------
// 🧱 Constants
// ---------------------------------------------------------

// 🎨 Configuração do efeito 3D (ajustável)
const CAROUSEL_CONFIG = {
  // Intensidade do efeito 3D
  PERSPECTIVE: 1000,           // Perspectiva da cena (px)
  ROTATE_Y_MAX: 45,            // Rotação máxima em Y (graus)
  SCALE_ACTIVE: 1,             // Escala do card ativo
  SCALE_ADJACENT: 0.85,        // Escala dos cards adjacentes
  SCALE_DISTANT: 0.7,          // Escala dos cards distantes
  OPACITY_ACTIVE: 1,           // Opacidade do card ativo
  OPACITY_ADJACENT: 0.7,       // Opacidade dos cards adjacentes
  OPACITY_DISTANT: 0.4,        // Opacidade dos cards distantes
  TRANSLATE_X_ADJACENT: 60,    // Offset X dos cards adjacentes (%)
  
  // Responsividade
  CARD_WIDTH_MOBILE: 85,       // Largura do card em mobile (%)
  CARD_WIDTH_TABLET: 70,       // Largura do card em tablet (%)
  CARD_WIDTH_DESKTOP: 50,      // Largura do card em desktop (%)
  
  // Swipe
  SWIPE_THRESHOLD: 50,         // Mínimo de px para considerar swipe
  VELOCITY_THRESHOLD: 500,     // Velocidade mínima para swipe rápido
};


// ---------------------------------------------------------
// 🎭 Project Modal Component
// ---------------------------------------------------------

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!project) return;
    
    const prevFocus = document.activeElement as HTMLElement | null;
    const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      
      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;
        
        const focusables = Array.from(
          modal.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter(Boolean);
        
        if (focusables.length === 0) return;
        
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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
        aria-labelledby="modal-title"
      >
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ y: 20, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-50 max-w-3xl w-full rounded-xl bg-card/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h3
              id="modal-title"
              className="text-xl font-orbitron font-semibold text-foreground"
            >
              {project.title}
            </h3>
            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="p-2 hover:bg-white/5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="relative h-64 md:h-full overflow-hidden rounded-lg">
              <img
                src={project.image}
                alt={`${t.accessibility.imageOf} ${project.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-sm">
                {project.longDescription || project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.techs.map((tech) => {
                  const Icon = tech.icon;
                  return (
                    <div
                      key={tech.name}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border"
                    >
                      <Icon className="text-base" style={{ color: tech.color }} />
                      <span className="text-xs font-medium uppercase">
                        {tech.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                {isValidLiveUrl(project.liveUrl) ? (
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    asChild
                  >
                    <a
                      href={project.liveUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.projectModal.visitSite} - ${project.title}`}
                    >
                  <ExternalLink className="h-4 w-4 mr-2" />
                      {t.projects.viewProject}
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    {t.projects.noDemo}
                  </Button>
                )}

                {project.githubUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.projectModal.viewSource} - ${project.title}`}
                    >
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
};

// ---------------------------------------------------------
// 🎴 Project Card 3D Component
// ---------------------------------------------------------

interface ProjectCard3DProps {
  project: Project;
  index: number;
  activeIndex: number;
  totalCards: number;
  onClick: () => void;
  onOpenModal: () => void;
}

const ProjectCard3D = ({ 
  project, 
  index, 
  activeIndex, 
  onClick, 
  onOpenModal 
}: ProjectCard3DProps) => {
  const { t } = useLanguage();
  const distance = index - activeIndex;
  const absDistance = Math.abs(distance);
  
  // Calcular transformações 3D baseadas na distância
  const rotateY = distance * -CAROUSEL_CONFIG.ROTATE_Y_MAX;
  const scale = absDistance === 0 
    ? CAROUSEL_CONFIG.SCALE_ACTIVE 
    : absDistance === 1 
      ? CAROUSEL_CONFIG.SCALE_ADJACENT 
      : CAROUSEL_CONFIG.SCALE_DISTANT;
  const opacity = absDistance === 0 
    ? CAROUSEL_CONFIG.OPACITY_ACTIVE 
    : absDistance === 1 
      ? CAROUSEL_CONFIG.OPACITY_ADJACENT 
      : CAROUSEL_CONFIG.OPACITY_DISTANT;
  const zIndex = 10 - absDistance;
  
  // Offset X baseado na distância
  const translateX = distance * CAROUSEL_CONFIG.TRANSLATE_X_ADJACENT;

  return (
    <motion.div
      className="absolute left-1/2 top-0 cursor-pointer"
      style={{
        width: "85%",
        maxWidth: "400px",
        transformStyle: "preserve-3d",
        zIndex,
      }}
      animate={{
        x: `calc(-50% + ${translateX}%)`,
        rotateY: rotateY,
        scale: scale,
        opacity: opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      }}
      onClick={absDistance === 0 ? onClick : undefined}
      whileHover={absDistance === 0 ? { scale: 1.02 } : undefined}
      role="group"
      aria-roledescription="slide"
      aria-label={`${t.accessibility.imageOf} ${project.title}`}
      tabIndex={absDistance === 0 ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" && absDistance === 0) onClick();
      }}
    >
      <Card
        className={`group relative overflow-hidden border transition-all duration-700 rounded-xl 
        bg-card/60 backdrop-blur-md shadow-lg h-full
        before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity
        ${absDistance === 0 
          ? "border-primary/40 hover:border-primary/60 shadow-2xl shadow-primary/20" 
          : "border-border/50"
        }`}
      >
        <div className="relative overflow-hidden">
          <img
            src={project.image}
            alt={`${t.accessibility.imageOf} ${project.title}`}
            className={`w-full h-56 object-cover transition-transform duration-700 ${
              absDistance === 0 ? "group-hover:scale-110" : ""
            }`}
            loading="lazy"
            draggable="false"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-700" />
        </div>

        <CardContent className="p-6 space-y-5">
          <div>
            <h3 className="font-orbitron font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-2">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {project.techs.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="relative flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-full border border-border hover:border-primary/50 transition-all"
                  title={tech.name}
                >
                  <Icon className="text-lg" style={{ color: tech.color }} />
                  <span className="text-xs font-medium text-foreground">
                    {tech.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
            {isValidLiveUrl(project.liveUrl) && (
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                aria-label={`${t.projectModal.visitSite} - ${project.title}`}
                asChild
              >
                <a
                  href={project.liveUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t.projects.viewProject}
                </a>
              </Button>
            )}

            <Button
              size="sm"
              variant={isValidLiveUrl(project.liveUrl) ? "outline" : "default"}
              className="flex-1"
              onClick={onOpenModal}
              aria-label={`${t.common.learnMore} - ${project.title}`}
            >
              {t.common.learnMore}
            </Button>

            {project.githubUrl && (
              <Button
                size="sm"
                variant="outline"
                aria-label={`${t.projectModal.viewSource} - ${project.title}`}
                asChild
              >
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ---------------------------------------------------------
// 🎪 Carousel 3D Component
// ---------------------------------------------------------

interface Carousel3DProps {
  projects: Project[];
  onCardClick: (project: Project) => void;
  onOpenModal: (project: Project) => void;
}

const Carousel3D = ({ projects, onCardClick, onOpenModal }: Carousel3DProps) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragXSpring = useSpring(dragX, { stiffness: 300, damping: 30 });
  
  const totalCards = projects.length;

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
      }
    };

    container.addEventListener("keydown", onKey as any);
    return () => container.removeEventListener("keydown", onKey as any);
  }, [next, prev]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset < -CAROUSEL_CONFIG.SWIPE_THRESHOLD || velocity < -CAROUSEL_CONFIG.VELOCITY_THRESHOLD) {
      next();
    } else if (offset > CAROUSEL_CONFIG.SWIPE_THRESHOLD || velocity > CAROUSEL_CONFIG.VELOCITY_THRESHOLD) {
      prev();
    }
    
    dragX.set(0);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {t.projects.noResults}
      </div>
    );
  }

  // Determinar quais cards mostrar (3-5 cards visíveis por vez)
  const visibleRange = 2; // Cards visíveis de cada lado
  const getVisibleCards = () => {
    const visible: number[] = [];
    for (let i = -visibleRange; i <= visibleRange; i++) {
      const index = (activeIndex + i + totalCards) % totalCards;
      visible.push(index);
    }
    return visible;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      tabIndex={-1}
      aria-roledescription="carousel"
      aria-label={t.projects.sectionTitle}
      style={{ perspective: `${CAROUSEL_CONFIG.PERSPECTIVE}px` }}
    >
      {/* Navigation Arrows */}
      <button
        onClick={prev}
        aria-label={t.accessibility.previousSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 bg-black/60 backdrop-blur-sm p-3 rounded-full hover:bg-black/80 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronLeft className="text-white w-5 h-5" />
      </button>

      <button
        onClick={next}
        aria-label={t.accessibility.nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 bg-black/60 backdrop-blur-sm p-3 rounded-full hover:bg-black/80 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronRight className="text-white w-5 h-5" />
      </button>

      {/* 3D Carousel Container */}
      <motion.div
        className="relative w-full overflow-hidden"
        style={{ 
          height: "520px",
          touchAction: "pan-y",
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {getVisibleCards().map((index) => {
            const project = projects[index];
            return (
              <ProjectCard3D
                key={`${project.id}-${index}`}
                project={project}
                index={index}
                activeIndex={activeIndex}
                totalCards={totalCards}
                onClick={() => onCardClick(project)}
                onOpenModal={() => onOpenModal(project)}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Dots Navigation */}
      <div 
        className="flex justify-center mt-6 gap-2 flex-wrap px-4" 
        role="tablist" 
        aria-label={t.projects.swipeHint}
      >
        {projects.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => goToSlide(index)}
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`${t.accessibility.goToPage} ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "bg-primary w-6 shadow-lg shadow-primary/50"
                : "bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Current Slide Indicator */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        <span className="text-primary font-semibold">{activeIndex + 1}</span>
        <span className="mx-1">/</span>
        <span>{totalCards}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 🧩 Main Component
// ---------------------------------------------------------

const PortfolioCarousel3D = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.techs.map((t) => t.name)))),
    []
  );

  const filtered = useMemo(() => {
    if (!selectedTag) return projects;
    return projects.filter((p) => p.techs.some((t) => t.name === selectedTag));
  }, [selectedTag]);

  const handleFilterChange = (tag: string | null) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const handleCardClick = (project: Project) => {
    setOpenProject(project);
  };

  const handleOpenModal = (project: Project) => {
    setOpenProject(project);
  };

  return (
    <section
      aria-roledescription="portfolio"
      aria-label={t.projects.sectionTitle}
      role="region"
      className="w-full py-20 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold text-foreground">
            {t.projects.sectionTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.projects.sectionSubtitle}
          </p>
        </motion.div>
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3" role="group" aria-label={t.projects.technologies}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className={`cursor-pointer px-5 py-2.5 text-sm rounded-full transition-all duration-300 hover:scale-110 ${
                selectedTag === null
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "border-border hover:bg-muted/30 hover:border-primary/50"
              }`}
              onClick={() => handleFilterChange(null)}
            >
              {t.common.viewAll}
            </Badge>
          </motion.div>

          {allTags.map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 1) * 0.08, duration: 0.6 }}
            >
              <Badge
                variant={selectedTag === tag ? "default" : "outline"}
                className={`cursor-pointer px-5 py-2.5 text-sm rounded-full transition-all duration-300 hover:scale-110 ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "border-border hover:bg-muted/30 hover:border-primary/50"
                }`}
                onClick={() => handleFilterChange(tag)}
              >
                {tag}
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* 3D Carousel */}
        <Carousel3D
          projects={filtered}
          onCardClick={handleCardClick}
          onOpenModal={handleOpenModal}
        />

        {/* Ver todos os projetos */}
        <motion.div
          className="flex justify-center pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Button
            size="lg"
            className="group px-8 py-3 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
            onClick={() => navigate('/projects-hub')}
          >
            Ver todos os projetos
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
    </section>
  );
};

export default PortfolioCarousel3D;
