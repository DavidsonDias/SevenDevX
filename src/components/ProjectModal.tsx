import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { X, ExternalLink, Github } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Props {
  project: null | {
    id: number;
    title: string;
    description: string;
    longDescription?: string;
    image: string;
    techs: { name: string }[];
    liveUrl?: string;
    githubUrl?: string;
  };
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: Props) {
  const { t } = useLanguage();

  useScrollLock(!!project);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!project) return null;

  // sanitize HTML content
  const safeHtml = project.longDescription ? DOMPurify.sanitize(project.longDescription, { ALLOWED_TAGS: ['p','ul','li','strong','em','br','a'], ALLOWED_ATTR: ['href','target','rel'] }) : "";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="project-modal-title"
      >
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

        <motion.div
          initial={{ y: 20, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="relative z-50 max-w-3xl w-full rounded-xl bg-card/95 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl"
        >
          <div className="p-4 flex items-start justify-between border-b border-white/5">
            <h3 id="project-modal-title" className="text-lg font-orbitron font-bold">{project.title}</h3>
            <button 
              onClick={onClose} 
              aria-label={t.accessibility.closeModal} 
              className="p-2 hover:bg-white/5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={project.image} 
                alt={`${t.accessibility.imageOf} ${project.title}`} 
                className="w-full h-60 object-cover" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-primary mb-2">{t.projectModal.overview}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
              </div>
              
              {safeHtml && (
                <div className="text-sm text-muted-foreground space-y-2" dangerouslySetInnerHTML={{ __html: safeHtml }} />
              )}

              {project.techs && project.techs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-primary mb-2">{t.projectModal.techStack}</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techs.map((tech) => (
                      <span 
                        key={tech.name}
                        className="px-3 py-1 bg-muted/30 rounded-full text-xs font-medium border border-border"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {project.liveUrl && (
                  <Button size="sm" variant="default" className="flex-1" asChild>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t.projectModal.visitSite}
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      {t.projectModal.viewSource}
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
}
