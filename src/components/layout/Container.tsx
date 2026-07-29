/**
 * Container.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/layout/Container.tsx
 * @module UI/Layout
 *
 * @description
 * Container responsivo padrão (larguras máximas do design system).
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Narrow width for article reading (~720px) */
  narrow?: boolean;
}

export function Container({ children, className, narrow }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-[720px]" : "max-w-[1200px]",
        className
      )}
    >
      {children}
    </div>
  );
}
