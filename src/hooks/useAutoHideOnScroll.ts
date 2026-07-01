/**
 * 🪄 useAutoHideOnScroll — esconde header ao rolar para baixo, mostra ao rolar para cima.
 * Mesma lógica usada no site público e no AdminPageShell.
 */
import { useEffect, useState } from "react";

export function useAutoHideOnScroll(threshold = 80) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsVisible(!(y > lastY && y > threshold));
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY, threshold]);
  return isVisible;
}
