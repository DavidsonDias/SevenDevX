/** @file src/components/UnsavedNavigationGuard.tsx
 * @module UI
 * @see docs/adr/ADR-005-sevenos-session-continuity.md
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { confirmLeaveEdits, hasUnsavedEdits } from '@/lib/unsavedChanges';

/** Protects browser exits, links and back/forward without replacing the router. */
export default function UnsavedNavigationGuard() {
  const location = useLocation();
  useEffect(() => {
    const currentIndex = window.history.state?.idx;
    let reverting = false;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedEdits()) return;
      event.preventDefault(); event.returnValue = '';
    };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.href === window.location.href) return;
      if (!confirmLeaveEdits()) { event.preventDefault(); event.stopPropagation(); }
    };
    const pop = (event: PopStateEvent) => {
      if (reverting) { reverting = false; event.stopImmediatePropagation(); return; }
      if (!hasUnsavedEdits() || confirmLeaveEdits()) return;
      const nextIndex = event.state?.idx;
      if (typeof currentIndex === 'number' && typeof nextIndex === 'number' && currentIndex !== nextIndex) {
        event.stopImmediatePropagation(); reverting = true; window.history.go(currentIndex - nextIndex);
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', click, true);
    window.addEventListener('popstate', pop, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', click, true); window.removeEventListener('popstate', pop, true); };
  }, [location.key]);
  return null;
}
