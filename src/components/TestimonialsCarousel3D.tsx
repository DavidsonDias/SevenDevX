/**
 * 🎠 TestimonialsCarousel3D - SevenDevX
 * Carrossel 3D coverflow para depoimentos
 * Mobile-first com swipe horizontal
 *
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, PanInfo, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { testimonialsData } from "@/i18n/translations";

// Avatar images
import avatarCarlos from "@/assets/avatar-carlos.jpg";
import avatarMaria from "@/assets/avatar-maria.jpg";
import avatarJoao from "@/assets/avatar-joao.jpg";
import avatarAna from "@/assets/avatar-ana.jpg";
import avatarPedro from "@/assets/avatar-pedro.jpg";
import avatarLucia from "@/assets/avatar-lucia.jpg";
import avatarRoberto from "@/assets/avatar-roberto.jpg";

// ---------------------------------------------------------
// 🎨 Configuração do Carrossel 3D
// ---------------------------------------------------------

const CAROUSEL_CONFIG = {
  PERSPECTIVE: 1200,
  ROTATE_Y_MAX: 50,
  SCALE_ACTIVE: 1,
  SCALE_ADJACENT: 0.8,
  SCALE_DISTANT: 0.6,
  OPACITY_ACTIVE: 1,
  OPACITY_ADJACENT: 0.6,
  OPACITY_DISTANT: 0.3,
  TRANSLATE_X_ADJACENT: 70,
  SWIPE_THRESHOLD: 50,
  VELOCITY_THRESHOLD: 500,
  AUTO_PLAY_INTERVAL: 5000,
};

const avatars = [
  avatarCarlos, 
  avatarMaria, 
  avatarJoao, 
  avatarAna, 
  avatarPedro, 
  avatarLucia, 
  avatarRoberto
];

// ---------------------------------------------------------
// 🎴 Testimonial Card 3D Component
// ---------------------------------------------------------

interface TestimonialCard3DProps {
  testimonial: {
    name: string;
    role: string;
    content: string;
    rating: number;
  };
  avatarIndex: number;
  index: number;
  activeIndex: number;
  onClick: () => void;
  t: any;
}

const TestimonialCard3D = ({
  testimonial,
  avatarIndex,
  index,
  activeIndex,
  onClick,
  t,
}: TestimonialCard3DProps) => {
  const distance = index - activeIndex;
  const absDistance = Math.abs(distance);

  const rotateY = distance * -CAROUSEL_CONFIG.ROTATE_Y_MAX;
  const scale =
    absDistance === 0
      ? CAROUSEL_CONFIG.SCALE_ACTIVE
      : absDistance === 1
        ? CAROUSEL_CONFIG.SCALE_ADJACENT
        : CAROUSEL_CONFIG.SCALE_DISTANT;
  const opacity =
    absDistance === 0
      ? CAROUSEL_CONFIG.OPACITY_ACTIVE
      : absDistance === 1
        ? CAROUSEL_CONFIG.OPACITY_ADJACENT
        : CAROUSEL_CONFIG.OPACITY_DISTANT;
  const zIndex = 10 - absDistance;
  const translateX = distance * CAROUSEL_CONFIG.TRANSLATE_X_ADJACENT;

  return (
    <motion.div
      className="absolute left-1/2 top-0 cursor-pointer"
      style={{
        width: "90%",
        maxWidth: "420px",
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
      aria-label={`${t.accessibility.testimonialFrom} ${testimonial.name}`}
      tabIndex={absDistance === 0 ? 0 : -1}
    >
      <div
        className={`group relative bg-zinc-950/60 backdrop-blur-md border p-6 sm:p-8 transition-all duration-500 rounded-xl
        ${
          absDistance === 0
            ? "border-white/30 shadow-2xl shadow-white/10"
            : "border-white/10"
        }`}
      >
        {/* Quote Icon */}
        <Quote
          className={`absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-300
          ${absDistance === 0 ? "text-white/20" : "text-white/5"}`}
        />

        {/* Rating */}
        <div className="flex gap-1 mb-4 sm:mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* Content */}
        <p className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 leading-relaxed italic min-h-[80px]">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 sm:gap-4 mt-auto">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-colors flex-shrink-0
            ${absDistance === 0 ? "border-white/40" : "border-white/20"}`}
          >
            <img
              src={avatars[avatarIndex]}
              alt={testimonial.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-white uppercase tracking-wide">
              {testimonial.name}
            </p>
            <p className="text-xs sm:text-sm text-white/60 uppercase tracking-wider">
              {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------
// 🎠 Main Carousel Component
// ---------------------------------------------------------

const TestimonialsCarousel3D = () => {
  const { language, t } = useLanguage();
  const testimonials = testimonialsData[language];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragX = useMotionValue(0);
  const springX = useSpring(dragX, { stiffness: 300, damping: 30 });

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }
    }, CAROUSEL_CONFIG.AUTO_PLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isDragging, testimonials.length]);

  // Navigate to specific index
  const goToIndex = useCallback((index: number) => {
    const wrappedIndex = ((index % testimonials.length) + testimonials.length) % testimonials.length;
    setActiveIndex(wrappedIndex);
  }, [testimonials.length]);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      const swipeThreshold = CAROUSEL_CONFIG.SWIPE_THRESHOLD;
      const velocityThreshold = CAROUSEL_CONFIG.VELOCITY_THRESHOLD;

      if (
        Math.abs(info.offset.x) > swipeThreshold ||
        Math.abs(info.velocity.x) > velocityThreshold
      ) {
        const direction = info.offset.x > 0 ? -1 : 1;
        goToIndex(activeIndex + direction);
      }

      dragX.set(0);
    },
    [activeIndex, dragX, goToIndex]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToIndex(activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        goToIndex(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goToIndex]);

  return (
    <section className="relative py-20 md:py-32 bg-black overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black opacity-50" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 uppercase tracking-tight leading-tight">
            {t.testimonials.sectionTitle}
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
            {t.testimonials.sectionSubtitle}
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <div
          ref={containerRef}
          className="relative mx-auto max-w-5xl"
          style={{ perspective: `${CAROUSEL_CONFIG.PERSPECTIVE}px` }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={() => goToIndex(activeIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hidden md:flex items-center justify-center"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
          </button>

          <button
            onClick={() => goToIndex(activeIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hidden md:flex items-center justify-center"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
          </button>

          {/* Carousel Container */}
          <motion.div
            className="relative h-[380px] sm:h-[400px] touch-pan-y"
            style={{ transformStyle: "preserve-3d" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            role="region"
            aria-roledescription="carousel"
            aria-label="Carrossel de depoimentos"
          >
            <AnimatePresence mode="popLayout">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard3D
                  key={`${language}-${index}`}
                  testimonial={testimonial}
                  avatarIndex={index}
                  index={index}
                  activeIndex={activeIndex}
                  onClick={() => setActiveIndex(index)}
                  t={t}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8 sm:mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-white w-6 sm:w-8"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Ir para depoimento ${index + 1}`}
              aria-current={index === activeIndex ? "true" : "false"}
            />
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-10 sm:mt-12 md:mt-16"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-6 sm:px-8 py-3 sm:py-4">
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

export default TestimonialsCarousel3D;
