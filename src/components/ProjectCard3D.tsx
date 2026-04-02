/**
 * 🎴 ProjectCard3D — Enterprise-grade subtle 3D tilt for project cards
 * Softer than ServiceCard3D: refined rotation, dynamic glow, scale on hover
 * Disabled on mobile (replaced with scale + shadow feedback)
 */

import { useRef, useState, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectCard3DProps {
  children: ReactNode;
  className?: string;
  tiltIntensity?: number;
  glow?: boolean;
}

const ProjectCard3D = ({
  children,
  className = "",
  tiltIntensity = 6,
  glow = true,
}: ProjectCard3DProps) => {
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  const scale = useSpring(
    useMotionValue(1),
    { stiffness: 300, damping: 25 }
  );

  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
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
  }, [mouseX, mouseY, scale]);

  // Mobile: simple scale + shadow on active/touch
  if (isMobile) {
    return (
      <motion.div
        className={className}
        whileTap={{ scale: 0.98 }}
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
      style={{ perspective: 900, transformStyle: "preserve-3d" }}
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
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      >
        {glow && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl z-20"
            style={{
              background: glowBackground,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard3D;
