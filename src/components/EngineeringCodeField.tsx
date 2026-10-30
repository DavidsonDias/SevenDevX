import TechIconCDN from '@/components/TechIconCDN';
import './engineering-code-field.css';
const technologies=[['react','React','#61dafb'],['typescript','TypeScript','#3178c6'],['nodedotjs','Node.js','#5fa04e'],['postgresql','PostgreSQL','#4169e1'],['git','Git','#f05032'],['vercel','Vercel','#fff']];
const snippets=[['interface.tsx','export function Experience() {','  return <SevenDevX />;','}'],['application.ts','const response = await api.get();','const result = schema.parse(response);','return result;'],['deploy.yml','quality: [types, tests, build]','release: production','status: ready']];
/** Decorative code illustration, never executed and excluded from assistive output. */
export default function EngineeringCodeField({layer}:{layer:number}){
 return <div className={`engineering-code-field code-layer-${layer}`} aria-hidden="true"><div className="code-field-grid"/>{snippets.map(([file,...lines],index)=><div key={file} className={`code-fragment fragment-${index} ${layer===index?'fragment-active':''}`}><span>{file}</span><pre>{lines.map((line,i)=><code key={line}><i>{String(i+1).padStart(2,'0')}</i>{line}{'\n'}</code>)}</pre></div>)}{technologies.map(([slug,name,color],i)=><div key={slug} className={`code-tech code-tech-${i}`}><TechIconCDN slug={slug} name={name} color={color} size={30}/><span>{name}</span></div>)}<div className="code-connector connector-a"/><div className="code-connector connector-b"/><div className="code-signal"/></div>;
}
