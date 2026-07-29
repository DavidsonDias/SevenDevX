/**
 * ProjectCard3D.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/ProjectCard3D.tsx
 * @module UI
 *
 * @description
 * Card de projeto com tilt 3D e transição compartilhada para o detalhe.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎴 ProjectCard3D — Enterprise-grade interactive 3D card
 * Features: parallax layers, dynamic spotlight glow, spring physics
 * CRITICAL: Click is NEVER blocked by animations — instant response
 * Mobile: disabled 3D, tap feedback only
 */

import { useRef, useState, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectCard3DProps {
  children: ReactNode;
  className?: string;
  tiltIntensity?: number;
  glow?: boolean;
  layoutId?: string;
}

const ProjectCard3D = ({
  children,
  className = "",
  tiltIntensity = 6,
  glow = true,
  layoutId,
}: ProjectCard3DProps) => {
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.8 };

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]),
    springConfig
  );

  const scale = useSpring(1, { stiffness: 300, damping: 25 });

  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x}% ${y}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 30%, transparent 60%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) / rect.width);
      mouseY.set((e.clientY - centerY) / rect.height);
    });
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    scale.set(1.02);
  }, [scale]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [mouseX, mouseY, scale]);

  /**
   * CRITICAL: On click/pointerDown, immediately reset all transforms
   * so the layoutId transition or modal open is never delayed by spring physics.
   */
  const handlePointerDown = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Instantly jump spring values to neutral
    rotateX.jump(0);
    rotateY.jump(0);
    scale.jump(1);
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [rotateX, rotateY, scale, mouseX, mouseY]);

  if (isMobile) {
    return (
      <motion.div
        className={className}
        layoutId={layoutId}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className={`${className} will-change-transform`}
      layoutId={layoutId}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
      >
        {glow && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl z-30"
            style={{
              background: glowBackground,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.4s ease-out",
            }}
          />
        )}

        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl z-20"
          style={{
            boxShadow: isHovered
              ? "inset 0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -15px rgba(0,0,0,0.4)"
              : "inset 0 0 0 1px rgba(255,255,255,0), 0 0 0 0 transparent",
            transition: "box-shadow 0.4s ease-out",
          }}
        />

        {children}
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard3D;
export { ProjectCard3D };
export type { ProjectCard3DProps };
