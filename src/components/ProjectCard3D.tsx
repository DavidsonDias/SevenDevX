/**
 * 🎴 ProjectCard3D — Subtle 3D tilt for project cards
 * Lighter version of ServiceCard3D: softer rotation, no heavy glow
 * Disabled on mobile for performance
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
  tiltIntensity = 5,
  glow = true,
}: ProjectCard3DProps) => {
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 25, mass: 0.5 };

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]),
    springConfig
  );

  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  // Must call useTransform at top level, not inside JSX
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {glow && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-inherit z-20"
            style={{
              background: glowBackground,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard3D;
