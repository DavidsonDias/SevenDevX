import { useEffect } from 'react';
import { useExperienceMotion } from '@/hooks/useExperienceMotion';
import './editorial-atmosphere.css';

/** Decorative accents only: no content is hidden and no React render runs on pointer movement. */
export default function EditorialAtmosphere({ target, version = '' }: { target: string; version?: string }) {
  const { reduced } = useExperienceMotion();
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(target);
    if (!root || reduced) return;
    const sections = [...root.querySelectorAll<HTMLElement>('.contact-guide, .contact-step-heading, .blog-reading-guide>div, .blog-catalog-heading, .blog-editorial-content article, .blog-editorial-cta, .article-reading-content h2, .article-signature, .article-related, .article-conclusion')];
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.atmosphereVisible = 'true'; observer?.unobserve(entry.target); } });
    }, { threshold: 0.12 }) : null;
    sections.forEach(section => observer?.observe(section));
    const panels = [...root.querySelectorAll<HTMLElement>('.contact-form-column form, .article-reading-tools')];
    let frame = 0;
    let pending: { element: HTMLElement; x: number; y: number } | null = null;
    const paint = () => { frame = 0; if (!pending || document.hidden) return; pending.element.style.setProperty('--accent-x', `${pending.x}px`); pending.element.style.setProperty('--accent-y', `${pending.y}px`); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const element = event.currentTarget as HTMLElement;
      const box = element.getBoundingClientRect();
      pending = { element, x: event.clientX - box.left, y: event.clientY - box.top };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    panels.forEach(panel => panel.addEventListener('pointermove', move, { passive: true }));
    return () => { observer?.disconnect(); cancelAnimationFrame(frame); panels.forEach(panel => { panel.removeEventListener('pointermove', move); panel.style.removeProperty('--accent-x'); panel.style.removeProperty('--accent-y'); }); sections.forEach(section => delete section.dataset.atmosphereVisible); };
  }, [target, version, reduced]);
  return null;
}
