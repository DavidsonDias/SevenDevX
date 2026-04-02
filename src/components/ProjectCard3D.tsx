/**
 * 🎴 ProjectCard3D — Enterprise-grade interactive 3D card
 * Features: parallax layers, dynamic spotlight glow, spring physics
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
  /** Framer Motion layoutId for shared layout transitions */
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

  // Spring physics — feels physical, not robotic
  const springConfig = { stiffness: 120, damping: 18, mass: 1 };

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]),
    springConfig
  );

  const scale = useSpring(1, { stiffness: 300, damping: 25 });

  // Spotlight glow follows cursor
  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x}% ${y}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 30%, transparent 60%)`
  );

  // Parallax offsets for internal layers
  const parallaxX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [8, -8]),
    springConfig
  );
  const parallaxY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [6, -6]),
    springConfig
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
    scale.set(1.025);
  }, [scale]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [mouseX, mouseY, scale]);

  // Mobile: simple scale + shadow on active/touch
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
        {/* Dynamic spotlight glow overlay */}
        {glow && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl z-30"
            style={{
              background: glowBackground,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}

        {/* Edge highlight on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl z-20"
          style={{
            boxShadow: isHovered
              ? "inset 0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -15px rgba(0,0,0,0.4)"
              : "inset 0 0 0 1px rgba(255,255,255,0), 0 0 0 0 transparent",
            transition: "box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
