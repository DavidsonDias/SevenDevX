/**
 * TechPreview.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/TechPreview.tsx
 * @module UI
 *
 * @description
 * Prévia do stack na home.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * TechPreview — Showcase de tecnologias com animações Framer Motion
 * Removido GSAP, usando apenas Framer Motion para consistência
 */

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { featuredTechs } from "@/utils/techData";
import TechModal from "./TechModal";
import TechIcon from "./TechIcon";
import type { Technology } from "@/utils/techData";
import techBackground from "@/assets/images/tech-background.webp";
import { useLanguage } from "@/i18n/LanguageContext";

const TechPreview = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleExploreAll = () => {
    navigate("/projects");
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="relative min-h-screen flex items-center py-20 md:py-32 overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={techBackground}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-foreground/10"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16 md:mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-foreground/5 border border-border px-4 py-2 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Stack Tecnológico
                </span>
              </motion.div>

              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 uppercase tracking-tight text-center leading-tight">
                {t.tech.sectionTitle}
              </h2>
              <p className="text-muted-foreground text-center text-xs sm:text-sm md:text-base uppercase tracking-wider max-w-2xl mx-auto">
                {t.tech.sectionSubtitle}
              </p>
            </motion.div>

            {/* Tech Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12"
            >
              {featuredTechs.map((tech, index) => (
                <motion.button
                  key={tech.name}
                  variants={cardVariants}
                  onClick={() => setSelectedTech(tech)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="tech-card relative group border border-border p-4 xs:p-5 sm:p-6 md:p-8 text-center hover:border-foreground/50 hover:bg-foreground/5 transition-all duration-500 cursor-pointer overflow-hidden"
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 blur-xl"
                    style={{ backgroundColor: tech.color }}
                    animate={{
                      opacity: hoveredIndex === index ? 0.15 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 right-0 w-[1px] h-4 bg-foreground/30" />
                    <div className="absolute top-0 right-0 w-4 h-[1px] bg-foreground/30" />
                  </div>

                  <div className="relative z-10">
                    {/* Floating animation on icon */}
                    <motion.div
                      className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 flex items-center justify-center"
                      animate={
                        hoveredIndex === index
                          ? { y: [0, -6, 0], rotate: [0, 3, -3, 0] }
                          : { y: 0, rotate: 0 }
                      }
                      transition={{
                        duration: 1.5,
                        repeat: hoveredIndex === index ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                    >
                      <TechIcon
                        icon={tech.icon}
                        size={40}
                        color={tech.color}
                        aria-label={`${tech.name} logo`}
                        className="sm:w-12 sm:h-12"
                      />
                    </motion.div>

                    <span className="text-[10px] xs:text-xs sm:text-sm tracking-wider font-medium uppercase block mb-1 sm:mb-2">
                      {tech.name}
                    </span>

                    {/* Accent line */}
                    <div className="w-full h-[2px] bg-foreground/10 mt-2 overflow-hidden hidden sm:block">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: tech.color }}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: "100%" } : {}}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>

                    <span className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block mt-2">
                      {t.tech.learnMore}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <motion.button
                onClick={handleExploreAll}
                className="inline-flex items-center gap-2 sm:gap-3 border-2 border-foreground px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">{t.tech.exploreAll}</span>
                <span className="sm:hidden">{t.common.viewAll}</span>
                <ArrowRight className="transform group-hover:translate-x-1 transition-transform" size={16} />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      <TechModal tech={selectedTech} onClose={() => setSelectedTech(null)} />
    </>
  );
};

export default TechPreview;
