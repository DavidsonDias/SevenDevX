/** @file src/components/AppViewport.tsx
 * @module UI
 * @see docs/adr/ADR-005-sevenos-session-continuity.md
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Viewport geometry only: the URL remains authoritative on reload and PWA launch. */
export default function AppViewport() {
  const { pathname } = useLocation();
  useEffect(() => {
    const root = document.documentElement, viewport = window.visualViewport;
    root.dataset.pwaSurface = pathname === '/' ? 'home' : 'solid';
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
