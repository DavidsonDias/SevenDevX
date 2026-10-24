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
import { useLocation, useNavigationType } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

/** Public navigation starts at the top; SevenOS restores per-account scroll on resume/back. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const action = useNavigationType();
  const { user } = useAuthContext();
  const userId = user?.id;
  useEffect(() => {
    if (!pathname.startsWith('/admin')) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    if (!userId) return;
    const key = `sevenos:scroll:${userId}:${pathname}`;
    let target = 0, restoring = true, frame = 0;
    try { const stored = JSON.parse(sessionStorage.getItem(key) || 'null'); if (action !== 'PUSH' && stored && Date.now() - stored.at < 86_400_000 && Number.isFinite(stored.y)) target = Math.max(0, stored.y); } catch { /* optional storage */ }
    const deadline = performance.now() + 3000;
    const restore = () => {
      if (!restoring) return;
      window.scrollTo({ top: target, behavior: 'instant' });
      if (document.documentElement.scrollHeight - window.innerHeight >= target || performance.now() >= deadline) restoring = false;
      else frame = requestAnimationFrame(restore);
    };
    const save = () => { if (!restoring) try { sessionStorage.setItem(key, JSON.stringify({ y: window.scrollY, at: Date.now() })); } catch { /* optional storage */ } };
    const stop = () => { restoring = false; cancelAnimationFrame(frame); };
    restore();
    window.addEventListener('scroll', save, { passive: true }); window.addEventListener('pagehide', save);
    window.addEventListener('wheel', stop, { passive: true }); window.addEventListener('touchstart', stop, { passive: true });
    return () => { save(); cancelAnimationFrame(frame); window.removeEventListener('scroll', save); window.removeEventListener('pagehide', save); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); };
  // Search/hash changes within an editor must not reset its scroll.
  }, [pathname, userId, action]);
  return null;
}
