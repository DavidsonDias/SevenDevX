import {useEffect,useRef,useState,type ReactNode} from 'react';
import {useExperienceMotion} from '@/hooks/useExperienceMotion';
import symbol from '@/assets/brand-symbol.svg';
import './public-services-journey.css';
export default function PublicServicesJourney({children,kind}:{children:ReactNode;kind:'catalogue'|'process'}){
 const root=useRef<HTMLDivElement>(null);const [step,setStep]=useState(0);const {reduced,compact}=useExperienceMotion();
 useEffect(()=>{const el=root.current;if(!el)return;let frame=0;
 const paint=()=>{frame=0;if(document.hidden)return;const rect=el.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;
 if(kind==='process'){const steps=[...el.querySelectorAll('li')].filter(node=>node.querySelector('button[aria-expanded]'));const active=steps.reduce((selected,node,index)=>node.getBoundingClientRect().top<innerHeight*.6?index:selected,0);setStep(active);}
 if(!reduced)el.style.setProperty('--journey-entry',String(Math.max(-1,Math.min(1,rect.top/innerHeight))));};
 const update=()=>{if(!frame)frame=requestAnimationFrame(paint);};addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',update);removeEventListener('resize',update);};
 },[kind,reduced,compact]);
 return <div ref={root} className={`services-journey journey-${kind} ${reduced?'journey-static':''}`}>
 {kind==='process'&&<div className="journey-process-sculpture" aria-hidden="true"><div className="journey-process-sticky"><img src={symbol} alt=""/><div className="journey-step-number">{String(step+1).padStart(2,'0')}<small>/ 06</small></div><div className="journey-step-track">{Array.from({length:6},(_,i)=><i key={i} className={i<=step?'is-reached':''}/>)}</div></div></div>}
 <div className="journey-original">{children}</div></div>;
}
