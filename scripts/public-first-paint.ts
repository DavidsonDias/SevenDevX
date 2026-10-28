import type { Plugin } from "vite";
import { build } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";

/** Static, replaceable first-paint content, generated from the real public Hero.
 * No Auth provider, API call, customer record or administrator screen is rendered.
 * React still owns the interactive application; this is not hydration markup.
 */
export function publicFirstPaint(): Plugin {
  return {
    name: "sevendevx-public-first-paint",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      async handler(html, ctx) {
        const poster = Object.keys(ctx.bundle || {}).find(name => /hero-tech-workspace.*\.webp$/.test(name));
        if (!poster) throw new Error("Public first paint requires the real hero poster");
        const root = process.cwd();
        const result = await build({
          absWorkingDir: root,
          stdin: {
            contents: `import React from 'react';
              import {renderToStaticMarkup} from 'react-dom/server';
              import Hero from './src/components/Hero';
              import {LanguageProvider} from './src/i18n/LanguageContext';
              import {translations} from './src/i18n/translations';
              export const markup = renderToStaticMarkup(React.createElement(LanguageProvider,null,React.createElement(Hero)));
              export const languages = Object.fromEntries(Object.entries(translations).map(([key,value])=>[key,value.hero]));`,
            resolveDir: root,
            loader: "tsx",
          },
          bundle: true,
          write: false,
          platform: "node",
          format: "cjs",
          packages: "external",
          jsx: "automatic",
          alias: { "@": path.join(root, "src") },
          plugins: [{
            name: "first-paint-poster-url",
            setup(builder) {
              builder.onLoad({ filter: /hero-tech-workspace\.webp$/ }, () => ({
                contents: `export default ${JSON.stringify("/" + poster)}`,
                loader: "js",
              }));
            },
          }],
        });
        const exports: { markup?: string; languages?: Record<string, { title: string; subtitle: string; cta: string }> } = {};
        const compiled = { exports };
        new Function("module", "exports", "require", result.outputFiles[0].text)(compiled, exports, createRequire(path.join(root, "package.json")));
        const rendered = compiled.exports;
        if (!rendered.markup?.includes("<h1") || !rendered.languages?.pt) throw new Error("Public first paint did not render the hero");
        const markup = rendered.markup
          .replace(/\s+type="button"/, "")
          .replace(/<button\b([^>]*)>/, '<a href="/#contact" data-initial-contact $1>')
          .replace(/<\/button>/, "</a>");
        const languages = JSON.stringify(rendered.languages).replaceAll("<", "\\u003c");
        const bootstrap = `<template id="public-first-paint">${markup}</template><script>
          (function(){
            var template=document.getElementById('public-first-paint'),root=document.getElementById('root');
            if(location.pathname!=='/'||!root){template.remove();return;}
            var languages=${languages},saved;
            try{saved=localStorage.getItem('sevendevx-language');}catch(e){}
            var language=languages[saved]?saved:(navigator.language||'pt').slice(0,2);
            if(!languages[language])language='pt';
            var selected=languages[language],fragment=template.content;
            var walker=document.createTreeWalker(fragment,NodeFilter.SHOW_TEXT),node;
            while(node=walker.nextNode()){
              for(var key of ['title','subtitle','cta']){
                if(Object.values(languages).some(function(value){return node.textContent.trim()===value[key];})){
                  node.textContent=selected[key];break;
                }
              }
            }
            var contact=fragment.querySelector('[data-initial-contact]');
            if(contact){contact.setAttribute('aria-label',selected.cta);contact.addEventListener('click',function(event){
              event.preventDefault();
              var observer=new MutationObserver(scroll);
              function scroll(){var target=document.getElementById('contact');if(target){observer.disconnect();target.scrollIntoView();}}
              observer.observe(root,{childList:true,subtree:true});scroll();setTimeout(function(){observer.disconnect();},30000);
            });}
            document.documentElement.lang=language==='pt'?'pt-BR':language;
            root.appendChild(fragment);template.remove();
          })();
        </script>`;
        return html.replace('<div id="root"></div>', '<div id="root"></div>' + bootstrap);
      },
    },
  };
}
