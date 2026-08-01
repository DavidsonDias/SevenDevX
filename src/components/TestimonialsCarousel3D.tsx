/**
 * TestimonialsCarousel3D.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/TestimonialsCarousel3D.tsx
 * @module UI
 *
 * @description
 * Depoimentos em carrossel 3D.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * TestimonialsCarousel3D — Carousel 3D com glassmorphism e i18n
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { testimonialsData } from "@/i18n/translations";

import avatarCarlos from "@/assets/avatar-carlos.jpg";
import avatarMaria from "@/assets/avatar-maria.jpg";
import avatarJoao from "@/assets/avatar-joao.jpg";
import avatarAna from "@/assets/avatar-ana.jpg";
import avatarPedro from "@/assets/avatar-pedro.jpg";
import avatarLucia from "@/assets/avatar-lucia.jpg";
import avatarRoberto from "@/assets/avatar-roberto.jpg";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const CONFIG = {
  PERSPECTIVE: 1200,
  ROTATE_Y_MAX: 50,
  SCALE: [1, 0.82, 0.65],
  OPACITY: [1, 0.55, 0.25],
  TRANSLATE_X: 70,
  SWIPE_THRESHOLD: 50,
  VELOCITY_THRESHOLD: 500,
  AUTO_PLAY: 5000,
};

const avatars = [avatarCarlos, avatarMaria, avatarJoao, avatarAna, avatarPedro, avatarLucia, avatarRoberto];

interface CardProps {
  testimonial: { name: string; role: string; content: string; rating: number };
  avatarIndex: number;
  index: number;
  activeIndex: number;
  onClick: () => void;
  t: any;
}

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

const TestimonialCard3D = ({ testimonial, avatarIndex, index, activeIndex, onClick, t }: CardProps) => {
  const distance = index - activeIndex;
  const abs = Math.abs(distance);
  const scale = CONFIG.SCALE[Math.min(abs, 2)];
  const opacity = CONFIG.OPACITY[Math.min(abs, 2)];

  return (
    <motion.div
      className="absolute left-1/2 top-0 cursor-pointer"
      style={{ width: "90%", maxWidth: "420px", transformStyle: "preserve-3d", zIndex: 10 - abs }}
      animate={{
        x: `calc(-50% + ${distance * CONFIG.TRANSLATE_X}%)`,
        rotateY: distance * -CONFIG.ROTATE_Y_MAX,
        scale, opacity,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
      onClick={abs === 0 ? onClick : undefined}
      whileHover={abs === 0 ? { scale: 1.02 } : undefined}
      role="group"
      aria-roledescription="slide"
      aria-label={`${t.accessibility.testimonialFrom} ${testimonial.name}`}
      tabIndex={abs === 0 ? 0 : -1}
    >
      <div className={`group relative bg-card/60 backdrop-blur-md border p-6 sm:p-8 transition-all duration-500
        ${abs === 0 ? "border-foreground/20 shadow-2xl shadow-foreground/5" : "border-border"}`}
      >
        {/* Quote */}
        <Quote className={`absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-300
          ${abs === 0 ? "text-foreground/15" : "text-foreground/5"}`} />

        {/* Rating */}
        <div className="flex gap-1 mb-4 sm:mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        {/* Content */}
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed italic min-h-[80px]">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 sm:gap-4 mt-auto">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-colors flex-shrink-0
            ${abs === 0 ? "border-foreground/30" : "border-border"}`}>
            <img src={avatars[avatarIndex]} alt={testimonial.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold uppercase tracking-wide">{testimonial.name}</p>
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{testimonial.role}</p>
          </div>
        </div>

        {/* Verified badge */}
        {abs === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background border border-border px-3 py-1">
            <Shield className="w-3 h-3 text-foreground/60" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">{t.testimonials.verifiedClient}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const TestimonialsCarousel3D = () => {
  const { language, t } = useLanguage();
  const testimonials = testimonialsData[language];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, CONFIG.AUTO_PLAY);
    return () => clearInterval(interval);
  }, [isDragging, testimonials.length]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(((index % testimonials.length) + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    setIsDragging(false);
    if (Math.abs(info.offset.x) > CONFIG.SWIPE_THRESHOLD || Math.abs(info.velocity.x) > CONFIG.VELOCITY_THRESHOLD) {
      goToIndex(activeIndex + (info.offset.x > 0 ? -1 : 1));
    }
  }, [activeIndex, goToIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToIndex(activeIndex - 1);
      else if (e.key === "ArrowRight") goToIndex(activeIndex + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, goToIndex]);

  return (
    <section className="relative py-20 md:py-32 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background opacity-50" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 uppercase tracking-tight leading-tight">
            {t.testimonials.sectionTitle}
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
            {t.testimonials.sectionSubtitle}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mx-auto max-w-5xl" style={{ perspective: `${CONFIG.PERSPECTIVE}px` }}>
          <button onClick={() => goToIndex(activeIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-foreground/5 hover:bg-foreground/10 border border-border hover:border-foreground/20 transition-all duration-300 hidden md:flex items-center justify-center"
            aria-label={t.accessibility.previousSlide}>
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </button>
          <button onClick={() => goToIndex(activeIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-foreground/5 hover:bg-foreground/10 border border-border hover:border-foreground/20 transition-all duration-300 hidden md:flex items-center justify-center"
            aria-label={t.accessibility.nextSlide}>
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </button>

          <motion.div className="relative h-[400px] sm:h-[420px] touch-pan-y" style={{ transformStyle: "preserve-3d" }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1}
            onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}
            role="region" aria-roledescription="carousel" aria-label={t.testimonials.sectionTitle}>
            <AnimatePresence mode="popLayout">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard3D key={`${language}-${index}`} testimonial={testimonial} avatarIndex={index}
                  index={index} activeIndex={activeIndex} onClick={() => setActiveIndex(index)} t={t} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10 sm:mt-12">
          {testimonials.map((_, index) => (
            <button key={index} onClick={() => setActiveIndex(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "bg-foreground w-6 sm:w-8" : "bg-foreground/20 w-2 sm:w-2.5 hover:bg-foreground/40"
              }`}
              aria-label={`${t.accessibility.goToPage} ${index + 1}`}
              aria-current={index === activeIndex ? "true" : "false"} />
          ))}
        </div>

        {/* Trust badge */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }} className="text-center mt-10 sm:mt-12 md:mt-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-foreground/5 backdrop-blur-sm border border-border px-6 sm:px-8 py-3 sm:py-4">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold">
              5.0 {t.testimonials.avgRating}
            </span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default TestimonialsCarousel3D;
