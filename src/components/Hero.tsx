
/**
 * Hero.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/Hero.tsx
 * @module UI
 *
 * @description
 * Hero da home; controla o vídeo de fundo com fallback
 * para conexões lentas e prioriza o LCP.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import heroBackground from "@/assets/images/hero-tech-workspace.webp";
import { usePublicCopy } from "@/i18n/usePublicCopy";
import { useLanguage } from "@/i18n/LanguageContext";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const HERO_VIDEO_DESKTOP = "/videos/hero-bg.mp4";
const HERO_VIDEO_MOBILE = "/videos/hero-bg-mobile.mp4";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const Hero = () => {
  const { t } = useLanguage();
  const { copy } = usePublicCopy();

  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const reduceMotion = useReducedMotion();

  // ==========================================================================
  // 📍 SCROLL TO CONTACT
  // ==========================================================================

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  // ==========================================================================
  // 🎬 VIDEO LOADING — LCP OPTIMIZATION
  // ==========================================================================

  useEffect(() => {
    if (!sectionRef.current) return;

    const conn = (navigator as any).connection;

    const slow =
      conn?.saveData === true ||
      /2g|slow-2g|3g/.test(conn?.effectiveType || "") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (slow) return;

    let cancelled = false;

    const start = async () => {
      // Preserve LCP optimization.
      await document.fonts.ready;

      await sectionRef.current
        ?.querySelector("img")
        ?.decode()
        .catch(() => {});

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) {
            setShouldLoadVideo(true);
          }
        })
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            void start();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  // ==========================================================================
  // ▶️ VIDEO PLAYBACK
  // ==========================================================================

  useEffect(() => {
    if (shouldLoadVideo && videoRef.current && !videoFailed) {
      videoRef.current.play().catch(() => {
        setVideoFailed(true);
      });
    }
  }, [shouldLoadVideo, videoFailed]);

  // ==========================================================================
  // 🎨 CTA ANIMATION VARIANTS
  // ==========================================================================

  const buttonVariants = {
    rest: {
      scale: 1,
    },
    hover: {
      scale: reduceMotion ? 1 : 1.05,
    },
    tap: {
      scale: reduceMotion ? 1 : 0.97,
    },
  };

  const fillVariants = {
    rest: {
      x: "-101%",
    },
    hover: {
      x: "0%",
    },
  };

  // ==========================================================================
  // 🖥️ RENDER
  // ==========================================================================

  return (
    <section
      id="main-content"
      ref={sectionRef}
      className="viewport-hero relative min-h-[100svh] flex items-end overflow-hidden"
      tabIndex={-1}
      aria-label={copy(
        "Seção principal de destaque com vídeo e introdução da SevenDevX"
      )}
    >
      {/* ================================================================ */}
      {/* BACKGROUND */}
      {/* ================================================================ */}

      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="SevenDevX"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        {shouldLoadVideo && !videoFailed && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            poster={heroBackground}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoFailed(true)}
          >
            <source
              src={
                isMobile
                  ? HERO_VIDEO_MOBILE
                  : HERO_VIDEO_DESKTOP
              }
              type="video/mp4"
            />
          </video>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/65 to-background/90" />
      </div>

      {/* ================================================================ */}
      {/* CONTENT */}
      {/* ================================================================ */}

      <div className="viewport-hero-content relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 md:pb-20 lg:pb-28">
        <motion.div
          initial={false}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="max-w-7xl mx-auto"
        >
          {/* TITLE */}

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 uppercase tracking-tight leading-[1.1] sm:leading-tight max-w-5xl">
            {t.hero.title}
          </h1>

          {/* SUBTITLE */}

          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-foreground/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* ============================================================ */}
          {/* CTA — CORRECTED ANIMATED BUTTON */}
          {/* ============================================================ */}

          <motion.button
            type="button"
            onClick={scrollToContact}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
              ease: "easeOut",
            }}
            className="
              group
              relative
              isolate
              inline-flex
              items-center
              justify-center
              overflow-hidden
              border-2
              border-foreground
              bg-transparent
              px-8
              sm:px-12
              py-3
              sm:py-4
              text-xs
              sm:text-sm
              tracking-widest
              uppercase
              font-semibold
              text-foreground
              cursor-pointer
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              focus-visible:ring-offset-2
              focus-visible:ring-offset-background
            "
            aria-label={t.hero.cta}
          >
            {/* Animated white background */}

            <motion.span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-0
                bg-foreground
              "
              variants={fillVariants}
              transition={{
                duration: reduceMotion ? 0 : 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            {/* CTA label and arrow */}

            <span
              className="
                relative
                z-10
                inline-flex
                items-center
                justify-center
                gap-2
                text-foreground
                transition-colors
                duration-300
                group-hover:text-background
                group-focus-visible:text-background
              "
            >
              <span>{t.hero.cta}</span>

              <span
                aria-hidden="true"
                className="
                  inline-block
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default Hero;
