/**
 * ScrollToTop.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/ScrollToTop.tsx
 * @module UI
 *
 * @description
 * Reposiciona o scroll no topo a cada navegação.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component - automatically scrolls to top on route change
 * Fixes the issue where pages open in the middle instead of at the top
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}
