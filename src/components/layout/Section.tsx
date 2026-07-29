/**
 * Section.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/layout/Section.tsx
 * @module UI/Layout
 *
 * @description
 * Seção vertical padronizada com espaçamento fluido.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-12 md:py-16 lg:py-20", className)}>
      {children}
    </section>
  );
}
