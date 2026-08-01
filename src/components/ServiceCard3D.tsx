/**
 * ServiceCard3D.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/ServiceCard3D.tsx
 * @module UI
 *
 * @description
 * Card de serviço com tilt 3D, alimentado pelo CMS de serviços.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎴 ServiceCard3D - SevenDevX
 * Card de serviço com efeito tilt 3D no hover
 * Efeito "cartão flutuante" interativo
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useRef, useState, ReactNode } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface ServiceCard3DProps {
  children: ReactNode;
  className?: string;
  /** Intensidade do efeito tilt (1-20, padrão: 10) */
  tiltIntensity?: number;
  /** Intensidade do glow (0-1, padrão: 0.3) */
  glowIntensity?: number;
  /** Cor do glow (padrão: branco) */
  glowColor?: string;
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const ServiceCard3D = ({
  children,
  className = "",
  tiltIntensity = 10,
  glowIntensity = 0.3,
  glowColor = "255, 255, 255",
}: ServiceCard3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values para rastrear posição do mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Configuração do spring para movimento suave
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };

  // Transformar posição do mouse em rotação 3D
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]),
    springConfig
  );

  // Posição do glow baseada no mouse
  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalizar posição do mouse (-0.5 a 0.5)
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;

    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ z: 50 }}
        transition={{ duration: 0.2 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-inherit"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(${glowColor}, ${isHovered ? glowIntensity : 0}) 0%, transparent 60%)`
            ),
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Card content */}
        <div className="relative z-10 w-full h-full">{children}</div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `linear-gradient(
                  ${105 + (Number(x) - 50) * 0.5}deg,
                  transparent 40%,
                  rgba(255, 255, 255, ${isHovered ? 0.1 : 0}) 50%,
                  transparent 60%
                )`
            ),
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default ServiceCard3D;