import { useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useExperienceMotion } from '@/hooks/useExperienceMotion';
import symbol from '@/assets/brand-symbol.svg';

export function BlogEditorialScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useExperienceMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      if (document.hidden || box.bottom < 0 || box.top > innerHeight) return;
      el.style.setProperty('--editorial-progress', String(Math.min(1, Math.max(0, -box.top / box.height))));
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, [reduced]);
  return <div ref={ref} className={`blog-editorial-scene ${reduced ? 'is-static' : ''}`} aria-hidden="true">
    <div className="editorial-grid" />
    <div className="editorial-volume"><div className="editorial-sheet sheet-back" /><div className="editorial-sheet sheet-middle" /><div className="editorial-sheet sheet-front"><div className="editorial-sheet-top"><span>SEVENDEVX / JOURNAL</span><img src={symbol} alt="" /></div><strong>IDEAS.<br/>CODE.<br/>IMPACT.</strong><div className="editorial-code"><span>&lt;article&gt;</span><i/><i/><i/><span>&lt;/article&gt;</span></div><span className="editorial-sheet-foot">DESIGN × ENGINEERING</span></div></div>
    <div className="editorial-orbit-label">KNOWLEDGE / IN MOTION</div>
  </div>;
}

export function BlogReadingGuide() {
  const { language } = useLanguage();
  const text = {pt:['Explore o próximo assunto','Conhecimento que vira prática.','Encontre artigos por assunto ou busque uma dúvida específica.','Explorar artigos','Soluções em ação','Veja como aplicamos tecnologia em projetos reais.','Conheça os projetos'],en:['Explore your next topic','Knowledge put into practice.','Find articles by topic or search for a specific question.','Explore articles','Solutions in action','See how we apply technology to real projects.','Explore projects'],es:['Explora tu próximo tema','Conocimiento que se aplica.','Encuentra artículos por tema o busca una pregunta concreta.','Explorar artículos','Soluciones en acción','Descubre cómo aplicamos tecnología en proyectos reales.','Conoce los proyectos']}[language];
  return <section className="blog-reading-guide" aria-label={text[0]}><div><span className="editorial-eyebrow">01 / {text[0]}</span><h2>{text[1]}</h2><p>{text[2]}</p><a href="#blog-explore">{text[3]} <span aria-hidden="true">↓</span></a></div><div><span className="editorial-eyebrow">02 / SEVENDEVX</span><h2>{text[4]}</h2><p>{text[5]}</p><a href="/projects-hub">{text[6]} <span aria-hidden="true">↗</span></a></div></section>;
}
