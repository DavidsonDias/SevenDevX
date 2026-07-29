/**
 * GlassCard.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/GlassCard.tsx
 * @module UI
 *
 * @description
 * Superfície glassmorphic base do design system; centraliza blur, borda e elevação.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🪟 GlassCard - Componente Glassmorphism Premium
 * SevenDevX Enterprise Edition
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
  variant?: "default" | "dark" | "light";
}

export const GlassCard = ({
  children,
  className,
  hover = true,
  glow = false,
  padding = "md",
  variant = "default",
}: GlassCardProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "bg-white/5 border-white/10",
    dark: "bg-black/40 border-white/5",
    light: "bg-white/10 border-white/20",
  };

  return (
    <motion.div
      whileHover={hover ? { 
        y: -4, 
        scale: 1.01,
        transition: { duration: 0.2 }
      } : undefined}
      className={cn(
        "relative rounded-xl border backdrop-blur-md transition-all duration-300",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover:border-white/30 hover:bg-white/10",
        glow && "shadow-[0_0_30px_rgba(255,255,255,0.1)]",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
