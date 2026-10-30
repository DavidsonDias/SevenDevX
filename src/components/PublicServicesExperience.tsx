import { useEffect, useRef, useState } from 'react';
import { useExperienceMotion } from '@/hooks/useExperienceMotion';
import { useLanguage } from '@/i18n/LanguageContext';
import brandSymbol from '@/assets/brand-symbol.svg';
import './public-services-experience.css';
type Service = { key: string; title: string; description: string; image: string; features: string[] };
export default function PublicServicesExperience({ services, title, subtitle }: {services: Service[]; title: string; subtitle: string}) {
  const root = useRef<HTMLElement>(null);
  const [active,setActive] = useState(0);
  const { reduced,compact } = useExperienceMotion();
  const { language } = useLanguage();
  const labels = {pt:['Explorar soluções','Ver detalhes','Selecione uma solução'],en:['Explore solutions','View details','Select a solution'],es:['Explorar soluciones','Ver detalles','Seleccione una solución']}[language];
  const items = services.slice(0,7);
  const item = items[Math.min(active,items.length-1)];
  useEffect(() => {
    const el=root.current;
    if(!el || reduced) return;
    let frame=0;
    const paint=()=>{frame=0; const rect=el.getBoundingClientRect(); if(rect.bottom<0 || rect.top>innerHeight || document.hidden)return;
      const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-innerHeight)));
      el.style.setProperty('--service-progress',String(progress));
      setActive(Math.min(items.length-1,Math.floor(progress*items.length)));
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);schedule();
    return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);};
  },[items.length,reduced,compact]);
  const choose=(index:number)=>{
    setActive(index);
    if(!reduced&&root.current){const el=root.current;window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(index+.2)/items.length*(el.offsetHeight-innerHeight),behavior:'smooth'});}
  };
  if(!item)return null;
  return <section ref={root} className={`service-theatre ${reduced?'service-theatre-static':''}`} aria-label={title}>
    <div className="service-stage">
      <div className="service-stage-grid" aria-hidden="true"/>
      <div className="service-intro"><span className="service-eyebrow">SEVENDEVX / {labels[0]}</span><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="service-sculpture" aria-hidden="true"><div className="service-orbit"/><div className="service-glass service-glass-back"/><div className="service-glass service-glass-mid"/><div className="service-device" key={item.key}><div className="service-device-top"><i/><i/><i/><img src={brandSymbol} alt=""/></div><img className="service-device-image" src={item.image} alt="" decoding="async"/><div className="service-device-floor"/></div><span className="service-axis">0{active+1} / 0{items.length}</span></div>
      <div className="service-caption" aria-live="off"><span>0{active+1}</span><div><h2>{item.title}</h2><p>{item.description}</p><div className="service-feature-tags">{item.features.slice(0,3).map(feature=><span key={feature}>{feature}</span>)}</div></div></div>
      <nav className="service-selector" aria-label={labels[2]}>{items.map((service,index)=><button type="button" key={service.key} aria-pressed={index===active} onClick={()=>choose(index)}><span>0{index+1}</span>{service.title}</button>)}</nav>
      <a className="service-details" href="#services-original">{labels[1]} <span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
