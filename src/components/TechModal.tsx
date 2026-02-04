import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Technology } from "@/utils/techData";
import { useEffect } from "react";
import TechIcon from "./TechIcon";
import { useLanguage } from "@/i18n/LanguageContext";

interface TechModalProps {
  tech: Technology | null;
  onClose: () => void;
}

const TechModal = ({ tech, onClose }: TechModalProps) => {
  const { t } = useLanguage();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (tech) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [tech, onClose]);

  return (
    <AnimatePresence>
      {tech && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-zinc-900 border border-white/20 p-8 md:p-12 max-w-2xl w-full shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded"
              aria-label={t.accessibility.closeModal}
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <motion.div 
                className="text-6xl md:text-7xl mb-6 flex items-center justify-center"
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <TechIcon 
                  icon={tech.icon} 
                  size={96} 
                  color={tech.color} 
                  aria-label={`${tech.name} logo`} 
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-2 uppercase tracking-tight">
                  {tech.name}
                </h3>
                <span 
                  className="inline-block px-4 py-1 mb-6 text-xs uppercase tracking-wider rounded-full"
                  style={{ 
                    backgroundColor: `${tech.color}20`,
                    color: tech.color,
                    borderColor: tech.color 
                  }}
                >
                  {tech.category}
                </span>
              </motion.div>

              <motion.p 
                className="text-white/80 leading-relaxed text-base md:text-lg mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {tech.description}
              </motion.p>

              <motion.a
                href={tech.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 text-sm uppercase tracking-wider font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.techModal.learnMore}
                <ExternalLink size={16} />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TechModal;