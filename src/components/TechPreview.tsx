import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { featuredTechs } from "@/utils/techData";
import TechModal from "./TechModal";
import TechIcon from "./TechIcon";
import type { Technology } from "@/utils/techData";
import techBackground from "@/assets/images/tech-background.webp";
import { useLanguage } from "@/i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const TechPreview = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll(".tech-card");
      
      gsap.fromTo(
        cards,
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  const handleExploreAll = () => {
    navigate("/projects");
  };

  return (
    <>
      <section 
        ref={sectionRef}
        className="relative min-h-screen flex items-center py-20 md:py-32 overflow-hidden"
      >
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={techBackground}
            alt={t.tech.sectionTitle}
            loading="lazy"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 uppercase tracking-tight text-center leading-tight">
              {t.tech.sectionTitle}
            </h2>
            
            <p className="text-white/60 text-center mb-10 sm:mb-12 md:mb-16 text-xs sm:text-sm md:text-base uppercase tracking-wider">
              {t.tech.sectionSubtitle}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12">
              {featuredTechs.map((tech, index) => (
                <motion.button
                  key={tech.name}
                  onClick={() => setSelectedTech(tech)}
                  className="tech-card relative group border border-white/20 p-4 xs:p-5 sm:p-6 md:p-8 text-center hover:border-white hover:bg-white/5 transition-all duration-300 cursor-pointer overflow-hidden"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                    style={{ backgroundColor: tech.color }}
                  />
                  
                  <div className="relative z-10">
                    <div className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                      <TechIcon 
                        icon={tech.icon} 
                        size={40} 
                        color={tech.color} 
                        aria-label={`${tech.name} logo`} 
                        className="sm:w-12 sm:h-12"
                      />
                    </div>
                    <span className="text-[10px] xs:text-xs sm:text-sm tracking-wider font-medium uppercase block mb-1 sm:mb-2">
                      {tech.name}
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs text-white/50 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                      {t.tech.learnMore}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <motion.button
                onClick={handleExploreAll}
                className="inline-flex items-center gap-2 sm:gap-3 border-2 border-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">{t.tech.exploreAll}</span>
                <span className="sm:hidden">{t.common.viewAll}</span>
                <ArrowRight className="transform group-hover:translate-x-1 transition-transform" size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <TechModal tech={selectedTech} onClose={() => setSelectedTech(null)} />
    </>
  );
};

export default TechPreview;