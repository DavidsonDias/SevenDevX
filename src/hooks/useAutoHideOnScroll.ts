/**
 * useAutoHideOnScroll.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useAutoHideOnScroll.ts
 * @module Hooks
 *
 * @description
 * Oculta cabeçalhos ao rolar para baixo e restaura ao subir.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🪄 useAutoHideOnScroll — esconde header ao rolar para baixo, mostra ao rolar para cima.
 * Mesma lógica usada no site público e no AdminPageShell.
 */
import { useEffect, useState } from "react";

/** Direction hysteresis avoids jitter. A keyboard-focused header stays reachable. */
export function useAutoHideOnScroll(threshold = 80) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    let lastY = window.scrollY, distance = 0, direction = 0, frame = 0;
    const measure = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY), delta = y - lastY;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection; lastY = y;
      const headerFocused = document.activeElement?.closest('[data-admin-header]') && document.activeElement.matches(':focus-visible');
      if (y <= threshold || headerFocused) setIsVisible(true);
      else if (distance >= (direction < 0 ? 8 : 16)) setIsVisible(direction < 0);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const focus = () => { if (document.activeElement?.closest('[data-admin-header]')) setIsVisible(true); };
    window.addEventListener('scroll', scroll, { passive: true }); document.addEventListener('focusin', focus);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', scroll); document.removeEventListener('focusin', focus); };
  }, [threshold]);
  return isVisible;
}
