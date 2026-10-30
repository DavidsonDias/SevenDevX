import { useEffect, useRef } from 'react';
import brandSymbol from '@/assets/brand-symbol.svg';
import TechIconCDN from '@/components/TechIconCDN';
import { useExperienceMotion } from '@/hooks/useExperienceMotion';
import './public-depth-scene.css';

/** Decorative public experience. Existing headings, cards and controls remain the page authority. */
export default function PublicDepthScene({ kind, images = [] }: { kind: 'services' | 'projects'; images?: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const { reduced, compact } = useExperienceMotion();
  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const observer = new IntersectionObserver(([entry]) => el.classList.toggle('depth-visible', entry.isIntersecting));
    observer.observe(el);
    let frame = 0;
    const paint = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight || document.hidden) return;
      el.style.setProperty('--depth-scroll', String(Math.max(-1, Math.min(1, box.top / innerHeight))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const pointer = (event: PointerEvent) => {
      el.style.setProperty('--depth-x', `${(event.clientX / innerWidth - .5) * 10}deg`);
      el.style.setProperty('--depth-y', `${(event.clientY / innerHeight - .5) * -8}deg`);
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('pointermove', pointer, { passive: true });
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); removeEventListener('pointermove', pointer); };
  }, [reduced, compact]);
  const technologies = [['react','React','#61DAFB'],['typescript','TypeScript','#3178C6'],['nodedotjs','Node.js','#5FA04E'],['supabase','Supabase','#3FCF8E'],['figma','Figma','#F24E1E'],['vercel','Vercel','#ffffff']];
  return <div ref={root} className={`public-depth-scene depth-${kind} ${reduced ? 'depth-static' : ''}`} aria-hidden="true">
    <div className="depth-object">
      {kind === 'services' ? images.slice(0,3).map((src,index) => <div className={`depth-interface depth-interface-${index}`} key={src}><div className="depth-browser"><i/><i/><i/><span/></div><img src={src} alt="" decoding="async"/><div className="depth-wire"><b/><b/><b/></div></div>) : <><div className="depth-core"><img src={brandSymbol} alt="" /></div><div className="depth-ring depth-ring-one"/><div className="depth-ring depth-ring-two"/><div className="depth-ring depth-ring-three"/>{technologies.map(([slug,name,color],index) => <div className={`depth-tech depth-tech-${index}`} key={slug}><TechIconCDN slug={slug} name={name} color={color} size={36}/></div>)}</>}
    </div>
  </div>;
}
