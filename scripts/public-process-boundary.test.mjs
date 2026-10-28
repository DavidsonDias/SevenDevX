import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

test('public process ignores a cached private template, while admin preview retains it',async()=>{
 const result=await build({stdin:{contents:`
  export {default as ProcessSection} from './src/components/services/ProcessSection';
  export {LanguageProvider} from './src/i18n/LanguageContext';
  export {auth} from './src/contexts/AuthContext';
  export {requests} from './src/hooks/useEcosystem';`,resolveDir:process.cwd(),loader:'tsx'},
  bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},
  plugins:[{name:'controlled-session-and-private-cache',setup(b){
   b.onLoad({filter:/[\\/]contexts[\\/]AuthContext\.tsx$/},()=>({loader:'js',contents:'export const auth={isAdmin:false};export const useAuthContext=()=>auth;'}));
   b.onLoad({filter:/[\\/]hooks[\\/]useEcosystem\.ts$/},()=>({loader:'js',contents:`export const requests=[];export const useDefaultProcessTemplate=enabled=>{
    requests.push(enabled);return {data:{stages:[{name:'PRIVATE TEST STAGE',description:'PRIVATE TEST DESCRIPTION',is_visible_on_site:true}]}};
   };`}));
   b.onLoad({filter:/[\\/]hooks[\\/]useAnalytics\.ts$/},()=>({loader:'js',contents:'export const useAnalytics=()=>({trackEvent(){}});'}));
  }}]});
 const module={exports:{}};
 new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const {ProcessSection,LanguageProvider,auth,requests}=module.exports;
 const render=()=>renderToStaticMarkup(React.createElement(LanguageProvider,null,React.createElement(ProcessSection)));
 assert.doesNotMatch(render(),/PRIVATE TEST/);
 assert.deepEqual(requests,[false]);
 auth.isAdmin=true;
 assert.match(render(),/PRIVATE TEST STAGE/);
 assert.deepEqual(requests,[false,true]);
});
