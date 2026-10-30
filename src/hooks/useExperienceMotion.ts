import {useEffect,useState} from 'react';
export function useExperienceMotion(){
 const read=()=>({reduced:typeof window==='undefined'?true:matchMedia('(prefers-reduced-motion: reduce)').matches||Boolean((navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData),compact:typeof window==='undefined'?true:matchMedia('(max-width:767px)').matches});
 const [value,setValue]=useState(read);
 useEffect(()=>{const motion=matchMedia('(prefers-reduced-motion: reduce)');const width=matchMedia('(max-width:767px)');const update=()=>setValue(read());motion.addEventListener('change',update);width.addEventListener('change',update);return()=>{motion.removeEventListener('change',update);width.removeEventListener('change',update);};},[]);
 return value;
}
