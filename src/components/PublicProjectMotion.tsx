import {useEffect} from 'react';
import {useExperienceMotion} from '@/hooks/useExperienceMotion';
export default function PublicProjectMotion(){
 const {reduced,compact}=useExperienceMotion();
 useEffect(()=>{
  if(reduced)return;
  const sections=[...document.querySelectorAll<HTMLElement>('.project-catalog-stage')];
  let frame=0;
  const paint=()=>{frame=0;if(document.hidden)return;sections.forEach(el=>{const rect=el.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;el.style.setProperty('--catalog-entry',String(Math.max(0,Math.min(1,rect.top/innerHeight))));});};
  const update=()=>{if(!frame)frame=requestAnimationFrame(paint);};
  const pointer=(event:PointerEvent)=>{sections.forEach(el=>{const rect=el.getBoundingClientRect();if(event.clientY<rect.top||event.clientY>rect.bottom)return;el.style.setProperty('--catalog-pointer',`${(event.clientX/innerWidth-.5)*4}deg`);});};
  addEventListener('scroll',update,{passive:true});addEventListener('pointermove',pointer,{passive:true});addEventListener('resize',update);update();
  return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',update);removeEventListener('pointermove',pointer);removeEventListener('resize',update);sections.forEach(el=>{el.style.removeProperty('--catalog-entry');el.style.removeProperty('--catalog-pointer');});};
 },[reduced,compact]);
 return null;
}
