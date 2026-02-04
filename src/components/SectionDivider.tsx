/**
 * 🚀 SectionDivider.tsx — SevenDevX v3.2 Hybrid PRO ULTIMATE
 * ═════════════════════════════════════════════════════════════════
 * 
 * Divisor de seção animado com setas SpaceX-style.
 * Versão híbrida: combina estabilidade v3.0 + features úteis v3.1.
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ ✨ FEATURES v3.2 HYBRID                                        │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * ✅ Scroll arrow animation (SpaceX-style)
 * ✅ Dual-arrow cascade effect with depth
 * ✅ Physics-inspired easing (cubic-bezier bounce)
 * ✅ Size variants: sm | md | lg
 * ✅ Speed control (0.5x - 2x+)
 * ✅ Animation toggle (animate prop)
 * ✅ Glow intensity: subtle | default | intense
 * ✅ Visual variants: default | cosmic | minimal | elegant (NOVO)
 * ✅ Trail effect opcional (NOVO, otimizado)
 * ✅ External className support
 * ✅ Accessible (aria-hidden, reduced-motion)
 * ✅ Performance optimized (zero hooks, zero listeners)
 * ✅ Mobile responsive (80% scaling)
 * ✅ TypeScript strict mode
 * ✅ Zero memory leaks
 * ✅ Production-ready
 * 
 * REMOVIDO (problemas v3.1):
 * ❌ autoScroll (performance hit)
 * ❌ parallax hover (pointer-events conflict)
 * ❌ quantum drift (confuso)
 * 
 * ═════════════════════════════════════════════════════════════════
 */

import React from "react";

type GlowIntensity = "subtle" | "default" | "intense";
type SizeVariant = "sm" | "md" | "lg";
type DividerVariant = "default" | "cosmic" | "minimal" | "elegant";

interface SectionDividerProps {
  /**
   * Cor da seta / stroke
   * @default "rgba(255,255,255,0.92)"
   */
  color?: string;

  /**
   * Intensidade do glow
   * @default "default"
   */
  glowIntensity?: GlowIntensity;

  /**
   * Tamanho do componente
   * sm: 28x18 (pequeno - footer, seções secundárias)
   * md: 34x22 (médio - padrão geral)
   * lg: 44x28 (grande - hero sections)
   * @default "md"
   */
  size?: SizeVariant;

  /**
   * Controla se as animações estão ativas
   * @default true
   */
  animate?: boolean;

  /**
   * Multiplicador de velocidade da animação
   * 0.5 = 2x mais rápido
   * 1.0 = velocidade padrão
   * 2.0 = 2x mais lento
   * @default 1
   */
  speed?: number;

  /**
   * Variante visual do divisor
   * default: Padrão (6.8s, bounce normal)
   * cosmic: Lento dramático (8.5s, cascata ampla)
   * minimal: Rápido discreto (5.5s, opacidade reduzida)
   * elegant: Suave premium (7.5s, glow sutil)
   * @default "default"
   */
  variant?: DividerVariant;

  /**
   * Adiciona trail glow extra na segunda seta
   * @default false
   */
  trail?: boolean;

  /**
   * Classe CSS adicional para customização externa
   * Útil para margin/padding com Tailwind
   * @example "mt-16 mb-8"
   */
  className?: string;
}

const glowConfig: Record<
  GlowIntensity,
  { base: string; peak: string; blurScale: number }
> = {
  subtle: {
    base: "0 0 4px rgba(255,255,255,0.12)",
    peak: "0 0 10px rgba(255,255,255,0.5), 0 0 12px rgba(0,150,255,0.18)",
    blurScale: 0.85,
  },
  default: {
    base: "0 0 6px rgba(255,255,255,0.25)",
    peak: "0 0 14px rgba(255,255,255,0.8), 0 0 20px rgba(0,150,255,0.4)",
    blurScale: 1,
  },
  intense: {
    base: "0 0 8px rgba(255,255,255,0.35)",
    peak: "0 0 18px rgba(255,255,255,1), 0 0 28px rgba(0,150,255,0.6)",
    blurScale: 1.15,
  },
};

const variantConfig: Record<
  DividerVariant,
  {
    duration: number;
    delay1: number;
    delay2: number;
    opacity1: number;
    opacity2: number;
    easing: string;
  }
> = {
  default: {
    duration: 6.8,
    delay1: 0,
    delay2: 0.6,
    opacity1: 0.95,
    opacity2: 0.78,
    easing: "cubic-bezier(.2,.9,.3,1.08)",
  },
  cosmic: {
    duration: 8.5,
    delay1: 0,
    delay2: 0.9,
    opacity1: 0.98,
    opacity2: 0.85,
    easing: "cubic-bezier(.15,.85,.25,1.1)",
  },
  minimal: {
    duration: 5.5,
    delay1: 0,
    delay2: 0.4,
    opacity1: 0.7,
    opacity2: 0.5,
    easing: "cubic-bezier(.3,.8,.4,1)",
  },
  elegant: {
    duration: 7.5,
    delay1: 0,
    delay2: 0.7,
    opacity1: 0.92,
    opacity2: 0.75,
    easing: "cubic-bezier(.25,.9,.35,1.05)",
  },
};

/**
 * SectionDivider v3.2 — Hybrid PRO
 * 
 * Divisor de seção animado com setas SpaceX-style.
 * Versão híbrida: estabilidade v3.0 + features úteis v3.1.
 * 
 * @example
 * // Padrão (médio, branco, velocidade normal)
 * <SectionDivider />
 * 
 * @example
 * // Hero section (grande, lento, intenso, cósmico)
 * <SectionDivider 
 *   size="lg" 
 *   speed={1.5} 
 *   glowIntensity="intense"
 *   variant="cosmic"
 * />
 * 
 * @example
 * // Footer (pequeno, sutil, azul, elegante)
 * <SectionDivider 
 *   size="sm" 
 *   glowIntensity="subtle" 
 *   color="rgba(0,150,255,0.9)"
 *   variant="elegant"
 * />
 * 
 * @example
 * // Com trail (segunda seta com glow extra)
 * <SectionDivider trail={true} />
 * 
 * @example
 * // Estático (sem animação)
 * <SectionDivider animate={false} />
 */
const SectionDivider: React.FC<SectionDividerProps> = ({
  color = "rgba(255,255,255,0.92)",
  glowIntensity = "default",
  size = "md",
  animate = true,
  speed = 1,
  variant = "default",
  trail = false,
  className = "",
}) => {
  const glow = glowConfig[glowIntensity];
  const variantSettings = variantConfig[variant];

  // Size configurations: SVG dimensions, container height, stroke width
  const sizeMap: Record<
    SizeVariant,
    { svgW: number; svgH: number; containerH: number; strokeW: number }
  > = {
    sm: { svgW: 28, svgH: 18, containerH: 36, strokeW: 1.6 },
    md: { svgW: 34, svgH: 22, containerH: 50, strokeW: 2 },
    lg: { svgW: 44, svgH: 28, containerH: 64, strokeW: 2.2 },
  };
  const s = sizeMap[size];

  // Animation durations (scaled by speed prop and variant)
  const scrollDur = `${(variantSettings.duration * speed)}s`;
  const glowDur = `${(3 * Math.max(0.85, speed))}s`;
  const delay1 = `${variantSettings.delay1 * speed}s`;
  const delay2 = `${variantSettings.delay2 * speed}s`;

  return (
    <div
      className={`sd-hybrid ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* Arrow 1 (primary) */}
      <svg
        className="sd-arrow sd-arrow-1"
        width={s.svgW}
        height={s.svgH}
        viewBox="0 0 34 22"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d="M2 5 L17 18 L32 5"
          fill="none"
          stroke={color}
          strokeWidth={s.strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Arrow 2 (cascading - creates depth effect) */}
      <svg
        className={`sd-arrow sd-arrow-2 ${trail ? "sd-trail" : ""}`}
        width={s.svgW}
        height={s.svgH}
        viewBox="0 0 34 22"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d="M2 5 L17 18 L32 5"
          fill="none"
          stroke={color}
          strokeWidth={s.strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style>{`
        /* ════════════════════════════════════════════════════════════
           Container Styles
           ════════════════════════════════════════════════════════════ */
        .sd-hybrid {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${s.containerH}px;
          margin-top: 8px;
          color: ${color};
          pointer-events: none;
        }

        /* ════════════════════════════════════════════════════════════
           Base Arrow Styles
           ════════════════════════════════════════════════════════════ */
        .sd-arrow {
          display: block;
          will-change: transform, opacity, filter;
          transform-origin: center;
        }

        .sd-arrow path {
          transition: stroke 200ms ease;
        }

        /* Arrow 1: Primary (variant-controlled opacity) */
        .sd-arrow-1 { 
          opacity: ${variantSettings.opacity1}; 
        }

        /* Arrow 2: Cascading (offset for depth, lighter opacity) */
        .sd-arrow-2 {
          position: absolute;
          top: 3px;
          opacity: ${variantSettings.opacity2};
          transform: translateY(0);
        }

        /* Trail effect (optional extra glow on arrow 2) */
        .sd-trail {
          filter: drop-shadow(0 0 10px ${color});
        }

        /* ════════════════════════════════════════════════════════════
           Keyframe Animations
           ════════════════════════════════════════════════════════════ */
        
        /* Scroll animation: subtle physics (down → rebound → settle → fade) */
        @keyframes sd-scroll {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          12% {
            opacity: 1;
            transform: translateY(0);
          }
          32% {
            transform: translateY(12px);
            opacity: 1;
          }
          50% {
            transform: translateY(0);
            opacity: 1;
          }
          72% {
            transform: translateY(10px);
            opacity: 0.85;
          }
          88% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 0;
            transform: translateY(0);
          }
        }

        /* Glow pulse: drop-shadow for GPU-friendly effect */
        @keyframes sd-glow {
          0%, 100% {
            filter: drop-shadow(${glow.base});
          }
          50% {
            filter: drop-shadow(${glow.peak});
          }
        }

        /* ════════════════════════════════════════════════════════════
           Animation Application (conditional via animate prop)
           ════════════════════════════════════════════════════════════ */
        ${animate ? `
          .sd-arrow {
            animation: sd-scroll ${scrollDur} ${variantSettings.easing} infinite,
                       sd-glow ${glowDur} ease-in-out infinite;
          }

          /* Stagger arrow 2 for cascade realism (variant-controlled) */
          .sd-arrow-1 { 
            animation-delay: ${delay1}, 0s; 
          }
          .sd-arrow-2 { 
            animation-delay: ${delay2}, ${Math.max(0.9, 0.9 * speed)}s; 
          }

          /* Trail effect: adiciona glow sem remover animação base */
          .sd-trail {
            animation: sd-scroll ${scrollDur} ${variantSettings.easing} infinite,
                       sd-glow ${glowDur} ease-in-out infinite;
            animation-delay: ${delay2}, ${Math.max(0.9, 0.9 * speed)}s;
          }
        ` : `
          /* Animations disabled - static subtle presence */
          .sd-arrow { 
            animation: none; 
            opacity: 0.9; 
            filter: drop-shadow(${glow.base}); 
          }
          
          .sd-trail {
            animation: none;
            opacity: 0.75;
            filter: drop-shadow(0 0 8px ${color});
          }
        `}

        /* ════════════════════════════════════════════════════════════
           Responsive Adjustments (Mobile < 640px)
           ════════════════════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .sd-hybrid { 
            height: ${Math.round(s.containerH * 0.8)}px;
            margin-top: 6px;
          }
          
          .sd-arrow { 
            width: ${Math.round(s.svgW * 0.82)}px;
            height: ${Math.round(s.svgH * 0.82)}px;
          }
          
          .sd-arrow-2 { 
            top: 2px;
          }
        }

        /* ════════════════════════════════════════════════════════════
           Accessibility: Reduced Motion Support
           ════════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .sd-arrow {
            animation: none !important;
            transition: none !important;
            opacity: 0.85 !important;
            filter: drop-shadow(${glow.base}) !important;
          }
          
          .sd-trail {
            animation: none !important;
            opacity: 0.7 !important;
            filter: drop-shadow(0 0 6px ${color}) !important;
          }
        }

        /* ════════════════════════════════════════════════════════════
           Light Mode Support (Optional)
           ════════════════════════════════════════════════════════════ */
        @media (prefers-color-scheme: light) {
          /* Se necessário, pode adicionar inversão de cor aqui */
          /* .sd-hybrid { color: rgba(0, 0, 0, 0.8); } */
        }
      `}</style>
    </div>
  );
};

export default SectionDivider;
