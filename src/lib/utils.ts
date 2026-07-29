/**
 * utils.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/lib/utils.ts
 * @module Lib
 *
 * @description
 * Utilidades gerais, incluindo composição de classes Tailwind.
 *
 * @see src/lib/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
