import { useEffect, useMemo, useState, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { articleOutline } from '@/lib/articleOutline';

export default function ArticleReadingTools({ content, fontSize, onFontSize }: { content: string; fontSize: number; onFontSize: (size: number) => void }) {
  const { language } = useLanguage();
  const items = useMemo(() => articleOutline(content), [content]);
  const [active, setActive] = useState('');
  const details = useRef<HTMLDetailsElement>(null);
  const words = { pt: ['Neste artigo', 'Ir para o conteúdo', 'Leitura sem distrações'], en: ['In this article', 'Jump to content', 'Focused reading'], es: ['En este artículo', 'Ir al contenido', 'Lectura sin distracciones'] }[language];
  useEffect(() => {
    setActive('');
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-100px 0px -55% 0px' });
    items.forEach(item => { const heading = document.getElementById(item.id); if (heading) observer.observe(heading); });
    return () => observer.disconnect();
  }, [items]);
  return <div className="article-reading-tools"><span className="article-reading-label">SEVENDEVX / {words[2]}</span><div className="article-type-controls" role="group" aria-label={{pt:'Tamanho do texto',en:'Text size',es:'Tamaño del texto'}[language]}><span>{{pt:'Texto',en:'Text',es:'Texto'}[language]}</span><button type="button" disabled={fontSize<=16} onClick={()=>onFontSize(fontSize-1)} aria-label={{pt:'Diminuir texto',en:'Decrease text size',es:'Reducir texto'}[language]}>A−</button><output aria-live="polite">{fontSize}px</output><button type="button" disabled={fontSize>=22} onClick={()=>onFontSize(fontSize+1)} aria-label={{pt:'Aumentar texto',en:'Increase text size',es:'Aumentar texto'}[language]}>A+</button><button type="button" onClick={()=>onFontSize(18)} aria-label={{pt:'Restaurar tamanho padrão',en:'Reset text size',es:'Restablecer tamaño del texto'}[language]}>↺</button></div>{items.length > 0 && <details ref={details}><summary>{words[0]} <span aria-hidden="true">↗</span></summary><nav aria-label={words[0]}>{items.map((item,i) => <a key={item.id} className={item.level===3?'is-subheading':''} href={`#${item.id}`} aria-current={active===item.id?'location':undefined} onClick={event => { const heading=document.getElementById(item.id); if(heading){ event.preventDefault(); if (details.current && matchMedia('(max-width: 700px)').matches) details.current.open=false; heading.scrollIntoView({behavior:'auto',block:'start'}); heading.focus({preventScroll:true}); } }}><span>{String(i+1).padStart(2,'0')}</span>{item.title}</a>)}</nav></details>}</div>;
}
