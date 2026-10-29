
/**
 * HeroContent.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/HeroContent.tsx
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

const mobileVideoCanStart = (initialMobile: boolean) => {
  if (typeof window === "undefined") return initialMobile;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return window.innerWidth < 768 && !connection?.saveData &&
    !/2g|slow-2g|3g/.test(connection?.effectiveType || "") &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const Hero = ({ initialMobile = false }: { initialMobile?: boolean }) => {
  const { t } = useLanguage();
  const { copy } = usePublicCopy();

  const [shouldLoadVideo, setShouldLoadVideo] = useState(() => mobileVideoCanStart(initialMobile));
  const [videoFailed, setVideoFailed] = useState(false);
  const [ctaActive, setCtaActive] = useState(false);

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : initialMobile;

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
    if (shouldLoadVideo) return;
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
      // Mobile keeps the poster element from first paint; select its deferred
      // source explicitly. Desktop retains its existing mount/play behavior.
      if (isMobile && !videoRef.current.currentSrc) videoRef.current.load();
      videoRef.current.play().catch(() => {
        setVideoFailed(true);
      });
    }
  }, [shouldLoadVideo, videoFailed]);

  // ==========================================================================
  // 🎨 CTA — ANIMAÇÃO SINCRONIZADA PARA MOUSE E TOQUE
  // ==========================================================================

  const ctaTransition = {
    duration: reduceMotion ? 0 : 0.35,
    ease: [0.22, 1, 0.36, 1] as const,
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
      {/* ================================================================== */}
      {/* BACKGROUND */}
      {/* ================================================================== */}

      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="SevenDevX"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          {...{ fetchpriority: "high" }}
          decoding="async"
        />

        {(isMobile || shouldLoadVideo) && !videoFailed && (
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
            {shouldLoadVideo && <source
              src={
                isMobile
                  ? HERO_VIDEO_MOBILE
                  : HERO_VIDEO_DESKTOP
              }
              type="video/mp4"
            />}
          </video>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/65 to-background/90" />
      </div>

      {/* ================================================================== */}
      {/* CONTENT */}
      {/* ================================================================== */}

      <div className="viewport-hero-content relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 md:pb-20 lg:pb-28">
        <motion.div
          initial={false}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="max-w-7xl mx-auto"
        >
          {/* ============================================================ */}
          {/* TITLE */}
          {/* ============================================================ */}

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 uppercase tracking-tight leading-[1.1] sm:leading-tight max-w-5xl">
            {t.hero.title}
          </h1>

          {/* ============================================================ */}
          {/* SUBTITLE */}
          {/* ============================================================ */}

          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-foreground/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* ============================================================ */}
          {/* CTA — SevenDevX | Desktop + Mobile */}
          {/* ============================================================ */}

          <motion.button
            type="button"
            onClick={scrollToContact}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen") {
                setCtaActive(true);
              }
            }}
            onPointerLeave={() => setCtaActive(false)}
            onPointerDown={(event) => {
              if (event.pointerType === "touch") setCtaActive(true);
            }}
            onPointerUp={(event) => {
              if (event.pointerType === "touch") setCtaActive(false);
            }}
            onPointerCancel={() => setCtaActive(false)}
            initial={false}
            animate={{ scale: ctaActive && !reduceMotion ? 1.04 : 1 }}
            whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="group relative isolate inline-flex items-center justify-center overflow-hidden border-2 border-foreground bg-transparent px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold text-foreground cursor-pointer select-none touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t.hero.cta}
          >
            {/* Fundo e conteúdo seguem o MESMO estado, inclusive no touch. */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 bg-foreground"
              initial={false}
              animate={{ x: ctaActive ? "0%" : "-101%" }}
              transition={ctaTransition}
            />

            <span
              className={`relative z-10 inline-flex items-center justify-center gap-2 transition-colors motion-reduce:transition-none ${
                ctaActive ? "text-background" : "text-foreground"
              }`}
              style={{ transitionDuration: reduceMotion ? "0ms" : "200ms" }}
            >
              <span>{t.hero.cta}</span>
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ x: ctaActive && !reduceMotion ? 4 : 0 }}
                transition={ctaTransition}
              >
                →
              </motion.span>
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
