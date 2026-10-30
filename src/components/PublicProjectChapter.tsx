import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useExperienceMotion } from '@/hooks/useExperienceMotion';
import { useProjects } from '@/hooks/useProjects';
import { usePublicCopy } from '@/i18n/usePublicCopy';
import { experienceScrollIndex } from '@/lib/experienceScroll';
import symbol from '@/assets/brand-symbol.svg';
import './public-project-chapters.css';
/** Public chapter transition; original catalogues and their modals are not transformed. */
export default function PublicProjectChapter({kind}:{kind:'technology'|'portfolio'}){
  const { data: projects = [] } = useProjects();
  const { copy: translate } = usePublicCopy();
  const [selection,setSelection] = useState(0);
  const featured=projects.slice(0,4);
  const current=featured[Math.min(selection,featured.length-1)];
  const root=useRef<HTMLElement>(null);
  const {language}=useLanguage();
  const {reduced,compact}=useExperienceMotion();
  const copy={pt:{technology:['01 / ENGENHARIA','Da tecnologia à experiência.','Explore as tecnologias'],portfolio:['02 / PROJETOS','Ideias que ganham dimensão.','Explore os projetos']},en:{technology:['01 / ENGINEERING','From technology to experience.','Explore technologies'],portfolio:['02 / PROJECTS','Ideas take on a new dimension.','Explore projects']},es:{technology:['01 / INGENIERÍA','De la tecnología a la experiencia.','Explorar tecnologías'],portfolio:['02 / PROYECTOS','Ideas que adquieren dimensión.','Explorar proyectos']}}[language][kind];
  useEffect(()=>{
    const el=root.current;if(!el||reduced)return;
    let frame=0;
    const paint=()=>{frame=0;const box=el.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight||document.hidden)return;const progress=Math.max(0,Math.min(1,(innerHeight-box.top)/(innerHeight+box.height)));el.style.setProperty('--chapter-progress',String(progress));if(kind==='portfolio'){const step=experienceScrollIndex(box.top,box.height,innerHeight,featured.length);setSelection(step);}};
    const update=()=>{if(!frame)frame=requestAnimationFrame(paint);};
    const observer=new IntersectionObserver(([entry])=>{el.classList.toggle('chapter-visible',entry.isIntersecting);if(entry.isIntersecting)update();});observer.observe(el);
    addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
    return()=>{observer.disconnect();cancelAnimationFrame(frame);removeEventListener('scroll',update);removeEventListener('resize',update);};
  },[reduced,kind,featured.length]);
  const layers = {
    pt:[['Interface','Experiência que conecta pessoas.','React · TypeScript · Tailwind CSS'],['Aplicação','Regras e dados por trás da experiência.','Node.js · PostgreSQL · APIs'],['Entrega','Do protótipo ao ambiente publicado.','Figma · GitHub · Vercel']],
    en:[['Interface','An experience that connects people.','React · TypeScript · Tailwind CSS'],['Application','Logic and data behind the experience.','Node.js · PostgreSQL · APIs'],['Delivery','From prototype to published environment.','Figma · GitHub · Vercel']],
    es:[['Interfaz','Una experiencia que conecta personas.','React · TypeScript · Tailwind CSS'],['Aplicación','Lógica y datos detrás de la experiencia.','Node.js · PostgreSQL · APIs'],['Entrega','Del prototipo al entorno publicado.','Figma · GitHub · Vercel']]
  }[language];
  const chooseProject=(index:number)=>{setSelection(index);if(!reduced&&root.current){const el=root.current;window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(index+.15)/featured.length*(el.offsetHeight-innerHeight),behavior:'smooth'});}};
  return <section ref={root} className={`project-chapter chapter-${kind} ${reduced?'chapter-reduced':''} ${compact?'chapter-mobile':''}`} aria-label={copy[0]}><div className="chapter-pin">
    <div className="chapter-dimension" aria-hidden="true">{kind==='technology'?<><div className="chapter-circuit circuit-a"/><div className="chapter-circuit circuit-b"/><div className="chapter-circuit circuit-c"/><div className={`engineering-layers engineering-layer-${selection}`}><div className="engineering-slab slab-0"><span>01 / UI</span></div><div className="engineering-slab slab-1"><span>02 / API</span></div><div className="engineering-slab slab-2"><span>03 / CLOUD</span></div></div><div className="chapter-brand"><img src={symbol} alt=""/></div></>:<><div className="chapter-frame frame-a">{current && <img src={current.image} alt="" loading="lazy"/>}</div><div className="chapter-frame frame-b"/><div className="chapter-frame frame-c"/><div className="chapter-frame frame-d"/><div className="chapter-frame frame-e"/></>}</div>
    <div className="chapter-copy"><span>{copy[0]}</span><h2>{copy[1]}</h2>
      {kind==='technology'?<div className="chapter-layer-picker"><div className="chapter-options" role="group" aria-label={language==='pt'?'Camadas da solução':language==='es'?'Capas de la solución':'Solution layers'}>{layers.map((layer,index)=><button key={layer[0]} type="button" aria-pressed={selection===index} onClick={()=>setSelection(index)}>{layer[0]}</button>)}</div><p>{layers[selection]?.[1]}</p><small>{layers[selection]?.[2]}</small></div>:current?<div className="chapter-project-picker"><h3>{translate(current.title)}</h3><p>{translate(current.description)}</p><div className="chapter-options" role="group" aria-label={language==='pt'?'Projetos em prévia':language==='es'?'Proyectos en vista previa':'Project previews'}>{featured.map((project,index)=><button key={project.id} aria-pressed={selection===index} onClick={()=>chooseProject(index)} type="button">{String(index+1).padStart(2,'0')} <span>{translate(project.title)}</span></button>)}</div></div>:null}
      <a href={kind==='technology'?'#project-technologies':'#project-portfolio'}>{copy[2]} <span aria-hidden="true">↓</span></a></div>
    <div className="chapter-meter" aria-hidden="true"><i/></div>
  </div></section>;
}
