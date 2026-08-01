/**
 * SkeletonLoader.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/SkeletonLoader.tsx
 * @module UI
 *
 * @description
 * Placeholders de carregamento padronizados.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 💀 SkeletonLoader - Loading States Premium
 * SevenDevX Enterprise Edition
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { cn } from "@/lib/utils";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  lines?: number;
  animate?: boolean;
}

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

export const Skeleton = ({
  className,
  variant = "rectangular",
  lines = 1,
  animate = true,
}: SkeletonProps) => {
  const baseClasses = cn(
    "bg-white/10 rounded",
    animate && "animate-pulse",
    className
  );

  if (variant === "text") {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4",
              i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "circular") {
    return <div className={cn(baseClasses, "rounded-full", className)} />;
  }

  if (variant === "card") {
    return (
      <div className={cn("bg-white/5 border border-white/10 rounded-xl p-6 space-y-4", className)}>
        <div className={cn(baseClasses, "h-40 w-full rounded-lg")} />
        <div className={cn(baseClasses, "h-6 w-3/4")} />
        <div className={cn(baseClasses, "h-4 w-full")} />
        <div className={cn(baseClasses, "h-4 w-2/3")} />
      </div>
    );
  }

  return <div className={baseClasses} />;
};

// Blog Post Skeleton
export const BlogPostSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-4/5" />
      <Skeleton variant="text" lines={3} />
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="h-8 w-8" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton variant="circular" className="h-8 w-8" />
    </div>
    <Skeleton className="h-10 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

// Chat Message Skeleton
export const ChatMessageSkeleton = () => (
  <div className="flex gap-3">
    <Skeleton variant="circular" className="h-8 w-8 flex-shrink-0" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-16 w-3/4 rounded-xl" />
    </div>
  </div>
);

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default Skeleton;
