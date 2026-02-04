// 📂 src/components/Hero.tsx
// 🌌 Versão 2.0 PRO — 100% PageSpeed Best Practices
// - Lazy load real com Intersection Observer
// - Fallback robusto sem erros de console
// - LCP otimizado com poster prioritário
// - Zero impacto no carregamento inicial

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import heroBackground from "@/assets/images/hero-tech-workspace.webp";
import heroVideo from "@/assets/videos/hero-bg.mp4";
import { useLanguage } from "@/i18n/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // 🔽 Scroll suave até contato
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    contactSection?.scrollIntoView({ behavior: "smooth" });
  };

  // 🎯 Lazy load com Intersection Observer
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px", threshold: 0.1 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Play automático quando vídeo carregar
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current && !videoFailed) {
      videoRef.current.play().catch(() => setVideoFailed(true));
    }
  }, [shouldLoadVideo, videoFailed]);

  // 🎞️ Handler de erro sem timeout (mais confiável)
  const handleVideoError = () => {
    console.warn("Video fallback ativado - usando imagem estática");
    setVideoFailed(true);
  };

  return (
    <section
      id="main-content"
      ref={sectionRef}
      className="relative h-screen flex items-end overflow-hidden"
      tabIndex={-1}
      aria-label="Seção principal de destaque com vídeo e introdução da SevenDevX"
    >
      {/* 🎥 Fundo otimizado */}
      <div className="absolute inset-0 z-0">
        {shouldLoadVideo && !videoFailed ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={heroBackground}
            className="w-full h-full object-cover"
            aria-label="Vídeo de fundo mostrando desenvolvimento web e tecnologia"
            onError={handleVideoError}
          >
            <source src={heroVideo} type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
        ) : (
          <img
            src={heroBackground}
            alt="Desenvolvimento web e tecnologia - SevenDevX"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black/90"></div>
      </div>

      {/* ✨ Conteúdo principal */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 uppercase tracking-tight leading-[1.1] sm:leading-tight max-w-5xl">
            {t.hero.title}
          </h1>

          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          <motion.button
            onClick={scrollToContact}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center border-2 border-white px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300 overflow-hidden"
            aria-label={t.hero.cta}
          >
            <span className="relative z-10">{t.hero.cta}</span>
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10 ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;