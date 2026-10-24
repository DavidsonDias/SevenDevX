/** @file src/components/AppViewport.tsx
 * @module UI
 * @see docs/adr/ADR-005-sevenos-session-continuity.md
 */
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

/** Restores only this account's non-secret admin location when an installed PWA starts cold. */
export default function AppViewport() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuthContext();
  const userId = user?.id;
  // Consume cold-start recovery once; explicit links to the public site must stay there.
  const resumeOnStartup = useRef(pathname === "/" && !search);
  useEffect(() => {
    if (pathname !== "/" || search) resumeOnStartup.current = false;
    if (isLoading) return;
    const shouldResume = resumeOnStartup.current;
    resumeOnStartup.current = false;
    if (!userId) return;
    const key = `sevenos:resume:${userId}`;
    try {
      if (pathname.startsWith('/admin')) {
        const params = new URLSearchParams(search), safe = new URLSearchParams();
        for (const name of ['edit', 'area', 'tab', 'page', 'sort', 'status']) {
          const value = params.get(name); if (value && value.length < 100) safe.set(name, value);
        }
        localStorage.setItem(key, JSON.stringify({ path: pathname + (safe.size ? `?${safe}` : ''), at: Date.now() }));
      } else if (shouldResume && pathname === '/' && !search && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)) {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved && Date.now() - saved.at < 86_400_000 && /^\/admin(?:\/|\?|$)/.test(saved.path) && !saved.path.includes('://')) navigate(saved.path, { replace: true });
      }
    } catch { /* Context persistence is optional; navigation never depends on storage access. */ }
  }, [userId, isLoading, pathname, search, navigate]);
  useEffect(() => {
    const root = document.documentElement, viewport = window.visualViewport;
    const update = () => {
      const height = viewport?.height || window.innerHeight;
      const inset = Math.max(0, window.innerHeight - height - (viewport?.offsetTop || 0));
      const editing = document.activeElement?.matches('input,textarea,[contenteditable="true"]');
      const keyboard = pathname.startsWith('/admin') && !!editing && inset > 150;
      root.style.setProperty('--sevenos-viewport-height', `${height}px`);
      root.dataset.sevenosKeyboard = String(keyboard);
      root.style.setProperty('--sevenos-chat-bottom', keyboard ? `${inset + 8}px` : '110px');
    };
    update(); viewport?.addEventListener('resize', update); viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update); document.addEventListener('focusin', update); document.addEventListener('focusout', update);
    return () => { viewport?.removeEventListener('resize', update); viewport?.removeEventListener('scroll', update); window.removeEventListener('resize', update); document.removeEventListener('focusin', update); document.removeEventListener('focusout', update); };
  }, [pathname]);
  return null;
}
