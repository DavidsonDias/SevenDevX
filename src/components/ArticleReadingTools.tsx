import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { articleOutline } from '@/lib/articleOutline';

export default function ArticleReadingTools({ content }: { content: string }) {
  const { language } = useLanguage();
  const items = useMemo(() => articleOutline(content), [content]);
  const [active, setActive] = useState('');
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
  return <div className="article-reading-tools"><span className="article-reading-label">SEVENDEVX / {words[2]}</span>{items.length > 0 && <details><summary>{words[0]} <span aria-hidden="true">↗</span></summary><nav aria-label={words[0]}>{items.map((item,i) => <a key={item.id} className={item.level===3?'is-subheading':''} href={`#${item.id}`} aria-current={active===item.id?'location':undefined} onClick={event => { const heading=document.getElementById(item.id); if(heading){ event.preventDefault(); heading.scrollIntoView({behavior:'auto',block:'start'}); heading.focus({preventScroll:true}); } }}><span>{String(i+1).padStart(2,'0')}</span>{item.title}</a>)}</nav></details>}</div>;
}
