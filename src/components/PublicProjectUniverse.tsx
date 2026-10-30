import { useExperienceCopy } from '@/i18n/publicExperienceCopy';
import { usePublicMotionPreference } from '@/hooks/usePublicMotionPreference';
import { useEffect, useRef, useState } from 'react';
import { usePublicCopy } from '@/i18n/usePublicCopy';
import logo from '@/assets/logo.svg';
import './public-project-universe.css';
type Scene = { title: string; image: string; description?: string };
type Dot = { x: number; y: number };
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seed = (i: number, o: number) => Math.sin(i * 127.1 + o * 311.7) * 43758.5453 % 1;
export default function PublicProjectUniverse({ projects }: { projects: Scene[] }) {
  const { copy } = usePublicCopy();
  const text = useExperienceCopy();
  const { reduced, compact } = usePublicMotionPreference();
  const scenes = projects.filter(p => p.image).slice(0, 8);
  const [dots, setDots] = useState<Dot[]>([]);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), tiles = useRef<HTMLDivElement>(null), planes = useRef<HTMLDivElement>(null), heading = useRef<HTMLDivElement>(null), caption = useRef<HTMLDivElement>(null);
  const brand = useRef<HTMLImageElement>(null), bar = useRef<HTMLSpanElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (reduced) { setDots([]); return; }
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas'); canvas.width = 266; canvas.height = 121;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.drawImage(image, 0, 0, 266, 121);
      const pixels = ctx.getImageData(0, 0, 266, 121).data, candidates: Dot[] = [];
      const stride = 4;
      for (let y = 0; y < 121; y += stride) for (let x = 0; x < 266; x += stride) if (pixels[(y * 266 + x) * 4 + 3] > 100) candidates.push({ x: x - 133, y: y - 60.5 });
      const limit = compact ? 140 : 360;
      setDots(candidates.filter((_, i) => i % Math.max(1, Math.ceil(candidates.length / limit)) === 0));
    };
    image.onerror = () => { if (!cancelled) setDots([]); }; image.src = logo;
    return () => { cancelled = true; image.onload = null; image.onerror = null; };
  }, [reduced, compact]);
  useEffect(() => {
    const element = root.current; if (!element || !scenes.length) return;
    let raf = 0, visible = true, currentIndex = -1;
    const paint = () => {
      raf = 0; if (!visible || document.hidden) return;
      const rect = element.getBoundingClientRect();
      const progress = reduced ? 0 : clamp(-rect.top / Math.max(1, element.offsetHeight - innerHeight));
      const burst = clamp(progress / .26), scale = innerWidth < 768 ? innerWidth * .0032 : Math.min(innerWidth * .002, 2.4);
      const dx = reduced ? 0 : pointer.current.x, dy = reduced ? 0 : pointer.current.y;
      if (tiles.current) Array.from(tiles.current.children).forEach((node, i) => {
        const dot = dots[i]; if (!dot) return;
        const tile = node as HTMLElement;
        tile.style.transform = `translate3d(${dot.x * scale + seed(i, 1) * innerWidth * .95 * burst + dx}px,${dot.y * scale + seed(i, 2) * innerHeight * .85 * burst + dy}px,${seed(i, 3) * 900 * burst}px) rotate(${seed(i, 4) * burst * 95}deg) scale(${1 + burst * 2.4})`;
        tile.style.opacity = String((.7 + Math.abs(seed(i, 5)) * .3) * (1 - clamp((progress - .08) / .35)));
      });
      if (brand.current) brand.current.style.opacity = String((dots.length ? .3 : .85) * (1 - burst));
      if (heading.current) { heading.current.style.opacity = String(1 - clamp(progress / .15)); heading.current.style.transform = `translateY(${-progress * 80}px)`; }
      if (caption.current) caption.current.style.opacity = String(clamp((progress - .10) / .15));
      const fly = clamp((progress - .10) / .83), index = Math.min(scenes.length - 1, Math.round(fly * (scenes.length - 1)));
      if (index !== currentIndex) { currentIndex = index; setActive(index); }
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
      if (planes.current) Array.from(planes.current.children).forEach((node, i) => {
        const distance = i - fly * (scenes.length - 1), plane = node as HTMLElement;
        plane.style.transform = `translate3d(${distance * innerWidth * .42 + dx * 2}px,${Math.sin(distance * 1.4) * innerHeight * .18 + dy * 2}px,${-Math.abs(distance) * 580}px) rotateY(${-distance * 12}deg) rotateZ(${distance * 3}deg)`;
        plane.style.opacity = String(clamp((progress - .05) / .15) * Math.max(.12, 1 - Math.abs(distance) * .32));
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (visible) schedule(); }); observer.observe(element);
    const move = (event: PointerEvent) => { if (event.pointerType !== 'mouse' || reduced) return; const r = stage.current?.getBoundingClientRect(); if (!r) return; pointer.current = { x: ((event.clientX - r.left) / r.width - .5) * 14, y: ((event.clientY - r.top) / r.height - .5) * 10 }; schedule(); };
    const reset = () => { pointer.current = { x: 0, y: 0 }; schedule(); };
    const target = stage.current; target?.addEventListener('pointermove', move); target?.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); document.addEventListener('visibilitychange', schedule); schedule();
    return () => { cancelAnimationFrame(raf); observer.disconnect(); target?.removeEventListener('pointermove', move); target?.removeEventListener('pointerleave', reset); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); document.removeEventListener('visibilitychange', schedule); };
  }, [dots, reduced, scenes.length]);
  const jump = (end: boolean) => { const el = root.current; if (!el) return; if (reduced) end = true; if (end) document.querySelector<HTMLElement>('.spatial-catalog')?.focus({ preventScroll: true }); window.scrollTo({ top: scrollY + el.getBoundingClientRect().top + (end ? el.offsetHeight - 80 : (el.offsetHeight - innerHeight) * .28), behavior: reduced ? 'instant' : 'smooth' }); };
  if (!scenes.length) return null;
  return <section ref={root} className={`public-project-universe motion-universe${reduced ? ' is-reduced' : ''}`} aria-label={text.universeLabel}>
    <div ref={stage} className="universe-stage">
      <div className="universe-top"><span>{text.signature}</span><button type="button" onClick={() => jump(true)}>{text.skip} ↘</button></div>
      {!reduced && <div className="universe-space" aria-hidden="true">
        <div className="universe-stars">{Array.from({ length: 50 }, (_, i) => <i key={i} style={{ left: `${50 + seed(i, 7) * 48}%`, top: `${50 + seed(i, 8) * 48}%`, opacity: .12 + Math.abs(seed(i, 6)) * .4 }} />)}</div>
        <img ref={brand} className="universe-brand" src={logo} alt="" />
        <div ref={tiles} className="universe-tiles">{dots.map((_, i) => <span key={i}><img src={scenes[i % scenes.length].image} alt="" decoding="async" /></span>)}</div>
        <div ref={planes} className="universe-planes">{scenes.map((project, i) => <div className="universe-plane" key={i}><img src={project.image} alt="" loading="lazy" /><span>{copy(project.title)}</span></div>)}</div>
      </div>}
      <div ref={heading} className="universe-intro"><p>{text.eyebrow}</p><h2>{text.titleOne}<br />{text.titleTwo}</h2><div className="universe-intro-bottom"><span>{text.introOne}<br />{text.introTwo}</span><button type="button" onClick={() => jump(false)}>{text.explore} <span>↓</span></button></div></div>
      <div ref={caption} className="universe-caption" aria-hidden="true"><span>{String(active + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}</span><h3>{copy(scenes[active]?.title)}</h3><p>{text.scroll}</p></div>
      {reduced && <div className="universe-reduced"><img src={scenes[0].image} alt={copy(scenes[0].title)} /><p>{text.staticNotice}</p></div>}
      <div className="universe-progress"><span ref={bar} /></div>
    </div>
  </section>;
}
