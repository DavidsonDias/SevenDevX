import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import heroBackground from "@/assets/images/hero-tech-workspace.webp";
import heroVideo from "@/assets/videos/hero-bg.mp4";
import heroVideoMobile from "@/assets/videos/hero-bg-mobile.mp4";
import { useLanguage } from "@/i18n/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { setShouldLoadVideo(true); observer.disconnect(); }
        });
      },
      { rootMargin: "50px", threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoadVideo && videoRef.current && !videoFailed) {
      videoRef.current.play().catch(() => setVideoFailed(true));
    }
  }, [shouldLoadVideo, videoFailed]);

  return (
    <section
      id="main-content"
      ref={sectionRef}
      className="relative h-screen flex items-end overflow-hidden"
      tabIndex={-1}
      aria-label="Seção principal de destaque com vídeo e introdução da SevenDevX"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {shouldLoadVideo && !videoFailed ? (
          <video
            ref={videoRef}
            muted loop playsInline autoPlay preload="metadata"
            poster={heroBackground}
            className="w-full h-full object-cover"
            onError={() => setVideoFailed(true)}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        ) : (
          <img src={heroBackground} alt="SevenDevX" width={1920} height={1080} className="w-full h-full object-cover" loading="eager" fetchPriority="high" decoding="async" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/65 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 md:pb-20 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 uppercase tracking-tight leading-[1.1] sm:leading-tight max-w-5xl">
            {t.hero.title}
          </h1>

          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-foreground/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          <motion.button
            onClick={scrollToContact}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center border-2 border-foreground px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300 overflow-hidden"
            aria-label={t.hero.cta}
          >
            <span className="relative z-10">{t.hero.cta}</span>
            <motion.div
              className="absolute inset-0 bg-foreground"
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
