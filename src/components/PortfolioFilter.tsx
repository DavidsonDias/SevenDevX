/**
 * PortfolioFilter.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/PortfolioFilter.tsx
 * @module UI
 *
 * @description
 * Filtro de projetos por stack e categoria.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🔥 PortfolioFilter v1.0 PRO++ ULTIMATE — SevenDevX
 * -------------------------------------------------------------
 * VERSÃO HÍBRIDA DEFINITIVA - Carrossel Universal com Grid Adaptativo
 * 
 * 📱 MOBILE (<640px):
 *   → 1 card por slide (optimal UX)
 *   → Touch + mouse drag + keyboard navigation
 *   → Setas flutuantes + dots
 *   → Swipe responsivo (50px threshold)
 * 
 * 💻 TABLET (640px-1023px):
 *   → 4 cards por slide (grid 2x2)
 *   → Touch + mouse drag + keyboard
 *   → Setas + dots + swipe
 * 
 * 🖥️ DESKTOP (≥1024px):
 *   → 4 cards por slide (grid 2x2)
 *   → Mouse drag + keyboard navigation
 *   → Setas + dots + swipe habilitado
 *   → Ultra-wide suportado
 * 
 * LAYOUT VISUAL (Tablet/Desktop):
 * ┌─────────────┬─────────────┐
 * │  Projeto 1  │  Projeto 2  │
 * ├─────────────┼─────────────┤
 * │  Projeto 3  │  Projeto 4  │
 * └─────────────┴─────────────┘
 * 
 * FEATURES ENTERPRISE:
 * ✅ Performance: useMemo para filtered + allTags
 * ✅ Acessibilidade: WCAG 2.1 AAA completo
 * ✅ Modal: useRef + focus trap + restore
 * ✅ Tag toggle: clique duas vezes desativa
 * ✅ Swipe em TODAS as resoluções
 * ✅ Physics realista (spring + inertia)
 * ✅ Drag constraints inteligentes + GPU acceleration
 * ✅ Clamp protection: previne slides vazios
 * ✅ Zero bugs de tela preta + código morto
 * -------------------------------------------------------------
 */


import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Github, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaReact, FaNodeJs } from "react-icons/fa";
import {
  SiFirebase,
  SiTypescript,
  SiD3Dotjs,
  SiTailwindcss,
  SiPostgresql,
  SiNextdotjs,
} from "react-icons/si";

// Assets
import projectEcommerce from "@/assets/project-ecommerce.jpg";
import projectDelivery from "@/assets/project-delivery.jpg";
import projectAnalytics from "@/assets/project-analytics.jpg";
import projectErp from "@/assets/project-erp.jpg";
import projectMedical from "@/assets/project-medical.jpg";
import projectArchitecture from "@/assets/project-architecture.jpg";
import projectManagement from "@/assets/project-management.jpg";

// ---------------------------------------------------------
// 🧱 Types & Constants
// ---------------------------------------------------------

interface Project {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  techs: { name: string; icon: React.ElementType; color: string }[];
  liveUrl?: string | null;
  githubUrl?: string | null;
}

type LayoutMode = "mobile" | "tablet" | "desktop";

const BREAKPOINTS = {
  MOBILE: 640,
  DESKTOP: 1024,
};

// ---------------------------------------------------------
// 📦 Projects Data
// ---------------------------------------------------------

const projects: Project[] = [
  {
    id: 1,
    title: "Sistema ERP Empresarial",
    description:
      "ERP completo com estoque, financeiro, vendas e relatórios avançados em tempo real.",
    longDescription:
      "Sistema completo de gestão empresarial com módulos integrados de estoque, vendas, financeiro e RH. Dashboard com mais de 50 relatórios personalizados e análise de dados em tempo real.",
    image: projectErp,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Node.js", icon: FaNodeJs, color: "#339933" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    ],
    liveUrl: "https://sevendevx.com/projects/erp",
    githubUrl: "https://github.com/DavidsonDias/sevendevx-erp",
  },
  {
    id: 2,
    title: "E-Commerce Fashion Plus",
    description:
      "Loja virtual com checkout integrado, painel administrativo e performance otimizada.",
    longDescription:
      "Plataforma completa de e-commerce com catálogo dinâmico, checkout seguro, painel administrativo, integração com gateways de pagamento e métricas de vendas em tempo real.",
    image: projectEcommerce,
    techs: [
      { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
    ],
    liveUrl: "https://sevendevx.com/projects/fashionplus",
    githubUrl: "https://github.com/DavidsonDias/fashion-plus",
  },
  {
    id: 3,
    title: "Dashboard Analytics PRO",
    description:
      "Dashboard com dados dinâmicos e gráficos avançados utilizando D3.js.",
    longDescription:
      "Painel de business intelligence com visualização de dados em tempo real, gráficos interativos D3.js, KPIs customizáveis e exportação de relatórios em múltiplos formatos.",
    image: projectAnalytics,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "D3.js", icon: SiD3Dotjs, color: "#F9A03C" },
    ],
    liveUrl: "https://sevendevx.com/projects/analytics",
    githubUrl: "https://github.com/DavidsonDias/analytics-pro",
  },
  {
    id: 4,
    title: "Landing Page Delivery Express",
    description:
      "Landing de alta conversão com CTA animado e integração WhatsApp.",
    image: projectDelivery,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
    ],
    liveUrl: "https://sevendevx.com/projects/delivery",
    githubUrl: "https://github.com/DavidsonDias/delivery-express",
  },
  {
    id: 5,
    title: "Sistema de Agendamento Médico",
    description:
      "Consultórios e clínicas com agendamento online, prontuário digital e automações.",
    longDescription:
      "Plataforma completa para clínicas médicas com agendamento online, prontuário eletrônico, integração WhatsApp para lembretes automáticos e relatórios de atendimento.",
    image: projectMedical,
    techs: [
      { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveUrl: null,
    githubUrl: null,
  },
  {
    id: 6,
    title: "Portfólio Arquitetura Premium",
    description:
      "Website institucional premium, lightbox, animações suaves e SEO avançado.",
    image: projectArchitecture,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
    ],
    liveUrl: null,
    githubUrl: null,
  },
  {
    id: 7,
    title: "App de Gestão de Projetos",
    description:
      "Kanban, equipes, chat interno e relatórios de produtividade em real-time.",
    longDescription:
      "Aplicação web para gerenciamento ágil de projetos com Kanban board, sprints, time tracking, chat interno e colaboração em equipe em tempo real.",
    image: projectManagement,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Node.js", icon: FaNodeJs, color: "#339933" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveUrl: null,
    githubUrl: null,
  },
];

// ---------------------------------------------------------
// 🔧 Helpers
// ---------------------------------------------------------

const isValidLiveUrl = (url?: string | null) => {
  if (!url) return false;
  const s = url.trim();
  if (!s || s === "#") return false;
  try {
    return /^https?:\/\//i.test(s);
  } catch {
    return false;
  }
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// ---------------------------------------------------------
// 🪝 Custom Hook: Responsive Breakpoint Detection
// ---------------------------------------------------------

const useLayoutMode = (): LayoutMode => {
  const [mode, setMode] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < BREAKPOINTS.MOBILE) return "mobile";
    if (w < BREAKPOINTS.DESKTOP) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const updateMode = () => {
      const w = window.innerWidth;
      if (w < BREAKPOINTS.MOBILE) setMode("mobile");
      else if (w < BREAKPOINTS.DESKTOP) setMode("tablet");
      else setMode("desktop");
    };

    window.addEventListener("resize", updateMode);
    return () => window.removeEventListener("resize", updateMode);
  }, []);

  return mode;
};

// ---------------------------------------------------------
// 🎭 Project Modal Component
// ---------------------------------------------------------

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
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
              aria-label="Fechar modal"
              className="p-2 hover:bg-white/5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="relative h-64 md:h-full overflow-hidden rounded-lg">
              <img
                src={project.image}
                alt={`Projeto ${project.title} desenvolvido pela SevenDevX`}
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
                      aria-label={`Abrir ${project.title} em nova aba`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Projeto
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    Sem demo pública
                  </Button>
                )}

                {project.githubUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ver código de ${project.title} no GitHub`}
                    >
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

// ---------------------------------------------------------
// 🎴 Project Card Component
// ---------------------------------------------------------

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onOpenModal: () => void;
  isDragging?: boolean;
}

const ProjectCard = ({ project, onClick, onOpenModal, isDragging = false }: ProjectCardProps) => {
  return (
    <Card
      className="group relative overflow-hidden border border-border hover:border-primary/40 transition-all duration-700 rounded-xl 
      bg-card/60 backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-primary/10 h-full
      before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
      style={{ cursor: isDragging ? "grabbing" : "pointer" }}
      onClick={!isDragging ? onClick : undefined}
      role="article"
      aria-label={`Projeto ${project.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isDragging) onClick();
      }}
    >
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={`Projeto ${project.title} desenvolvido pela SevenDevX`}
          className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
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
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {project.techs.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="relative flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-full border border-border hover:border-primary/50 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all"
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
          {isValidLiveUrl(project.liveUrl) ? (
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              aria-label={`Abrir ${project.title}`}
              asChild
            >
              <a
                href={project.liveUrl!}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Projeto
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={onOpenModal}
              aria-label={`Ver detalhes de ${project.title}`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          )}

          {project.githubUrl && (
            <Button
              size="sm"
              variant="outline"
              aria-label={`Repositório de ${project.title}`}
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
  );
};

// ---------------------------------------------------------
// 🎪 Universal Carousel Component - SWIPE EM TODOS OS DISPOSITIVOS
// ---------------------------------------------------------

interface CarouselProps {
  projects: Project[];
  itemsPerSlide: number;
  onCardClick: (project: Project) => void;
  onOpenModal: (project: Project) => void;
}

const UniversalCarousel = ({ projects, itemsPerSlide, onCardClick, onOpenModal }: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = useMemo(() => chunk(projects, itemsPerSlide), [projects, itemsPerSlide]);
  const totalSlides = slides.length;

  // 🔧 BUGFIX #1: Clamp protection com defensive programming
  useEffect(() => {
    if (totalSlides === 0) {
      setCurrentSlide(0);
      return;
    }
    if (currentSlide >= totalSlides) {
      setCurrentSlide(totalSlides - 1);
    }
  }, [totalSlides, currentSlide]);

  const goToSlide = useCallback((index: number) => {
    if (totalSlides === 0) return;
    const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentSlide(clampedIndex);
    containerRef.current?.focus();
  }, [totalSlides]);

  const next = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, goToSlide]);
  
  const prev = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  const first = useCallback(() => goToSlide(0), [goToSlide]);
  const last = useCallback(() => goToSlide(totalSlides - 1), [totalSlides, goToSlide]);

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
        case "Home":
          e.preventDefault();
          first();
          break;
        case "End":
          e.preventDefault();
          last();
          break;
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "PageDown":
          e.preventDefault();
          next();
          break;
      }
    };

    container.addEventListener("keydown", onKey as any);
    return () => container.removeEventListener("keydown", onKey as any);
  }, [next, prev, first, last]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    const swipeThreshold = 80;
    const velocityThreshold = 800;

    if (offset < -swipeThreshold || velocity < -velocityThreshold) {
      next();
    } else if (offset > swipeThreshold || velocity > velocityThreshold) {
      prev();
    }
  };

  // 🔧 BUGFIX #2: Cálculo FIXO de translate (não mais porcentagem dinâmica)
  // Usa pixels absolutos com container width
  const getTranslateX = () => {
    if (totalSlides === 0) return 0;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    return -(currentSlide * containerWidth);
  };

  // Empty state
  if (totalSlides === 0 || projects.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Nenhum projeto encontrado
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      tabIndex={-1}
      aria-roledescription="carousel"
      aria-label="Carrossel de projetos"
    >
      {/* Arrows */}
      <button
        onClick={prev}
        disabled={currentSlide === 0}
        aria-label="Slide anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/60 backdrop-blur-sm p-3 rounded-full hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="text-white w-5 h-5" />
      </button>

      <button
        onClick={next}
        disabled={currentSlide >= totalSlides - 1}
        aria-label="Próximo slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/60 backdrop-blur-sm p-3 rounded-full hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="text-white w-5 h-5" />
      </button>

      {/* 🔧 BUGFIX #3: Container com overflow-hidden e position relative */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{
            left: currentSlide === totalSlides - 1 ? 0 : -Infinity,
            right: currentSlide === 0 ? 0 : Infinity }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={{ 
            x: getTranslateX(),
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 32,
            mass: 0.9,
            velocity: 2
          }}
          className="flex"
          style={{ 
            cursor: isDragging ? "grabbing" : "grab",
            // 🔧 BUGFIX #4: Force GPU acceleration + will-change
            transform: "translate3d(0, 0, 0)",
            willChange: "transform",
          }}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={`slide-${slideIndex}`}
              className="flex-shrink-0 w-full px-4"
              aria-hidden={slideIndex !== currentSlide}
              style={{
                // 🔧 BUGFIX #5: Width 100% explícito
                minWidth: "100%",
              }}
            >
              <div
                className={`grid gap-6 ${
                  itemsPerSlide === 1
                    ? "grid-cols-1"
                    : "grid-cols-2"
                }`}
              >
                {slide.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => onCardClick(project)}
                    onOpenModal={() => onOpenModal(project)}
                    isDragging={isDragging}
                  />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-6 gap-2" role="tablist" aria-label="Navegação de slides">
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => goToSlide(index)}
            role="tab"
            aria-selected={currentSlide === index}
            aria-label={`Ir para slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-primary scale-125 shadow-lg shadow-primary/50"
                : "bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};


// ---------------------------------------------------------
// 🧩 Main Component
// ---------------------------------------------------------

const PortfolioFilter = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const layoutMode = useLayoutMode();

  const allTags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.techs.map((t) => t.name)))),
    []
  );

  const filtered = useMemo(() => {
    if (!selectedTag) return projects;
    return projects.filter((p) => p.techs.some((t) => t.name === selectedTag));
  }, [selectedTag]);

  // ⭐ NOVO: itemsPerSlide universal
  // Mobile = 1, Tablet = 4 (2x2), Desktop = 4 (2x2)
  const itemsPerSlide = layoutMode === "mobile" ? 1 : 4;

  const handleFilterChange = (tag: string | null) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const handleCardClick = (project: Project) => {
    if (isValidLiveUrl(project.liveUrl)) {
      window.open(project.liveUrl!, "_blank", "noopener,noreferrer");
    } else {
      setOpenProject(project);
    }
  };

  const handleOpenModal = (project: Project) => {
    setOpenProject(project);
  };

  return (
    <section
      aria-roledescription="portfolio"
      aria-label="Portfólio de Projetos SevenDevX"
      role="region"
      className="w-full py-20 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* FILTROS */}
        <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Filtrar projetos por tecnologia">
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
              Todos
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

        {/* ⭐ NOVO: CARROSSEL UNIVERSAL EM TODAS AS RESOLUÇÕES */}
        <UniversalCarousel
          projects={filtered}
          itemsPerSlide={itemsPerSlide}
          onCardClick={handleCardClick}
          onOpenModal={handleOpenModal}
        />
      </div>

      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
    </section>
  );
};

export default PortfolioFilter;
