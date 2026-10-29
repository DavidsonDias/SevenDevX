import type { Plugin } from "vite";
import { build } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";

/** Hydratable first-paint content, generated from the real public Hero.
 * No Auth provider, API call, customer record or administrator screen is rendered.
 * Only this public island is hydrated; the rest of the app starts normally.
 */
export function publicFirstPaint(): Plugin {
  return {
    name: "sevendevx-public-first-paint",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      async handler(html, ctx) {
        // The one global stylesheet is needed on every route. Inline its exact
        // emitted contents so first paint does not wait for another request.
        // Keep the emitted asset for service-worker caches and dynamic imports.
        html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, tag => {
          const file = tag.match(/href="\/([^\"]+)"/)?.[1];
          const asset = file && ctx.bundle?.[file];
          if (!asset || asset.type !== "asset" || typeof asset.source !== "string") return tag;
          if (/<\/style/i.test(asset.source)) throw new Error("Unsafe inline stylesheet boundary");
          return `<style data-initial-styles="${file}">${asset.source}</style>`;
        });
        const poster = Object.keys(ctx.bundle || {}).find(name => /hero-tech-workspace.*\.webp$/.test(name));
        if (!poster) throw new Error("Public first paint requires the real hero poster");
        // Discover the existing mobile poster before the application modules.
        // The media condition leaves desktop loading behavior unchanged.
        html = html.replace(/(<meta\s+name="viewport"[^>]*>)/,
          `$1\n<link rel="preload" as="image" href="/${poster}" fetchpriority="high" media="(max-width: 767px)">`);
        const root = process.cwd();
        const result = await build({
          absWorkingDir: root,
          stdin: {
            contents: `import React from 'react';
              import {renderToString} from 'react-dom/server';
              import Hero from './src/components/HeroContent';
              import {LanguageSnapshotProvider} from './src/i18n/LanguageContext';
              import {translations} from './src/i18n/translations';
              export const markups = Object.fromEntries(Object.entries(translations).map(([language,t])=>
                [language,Object.fromEntries([false,true].map(initialMobile=>
                  [initialMobile?'mobile':'desktop',renderToString(React.createElement(LanguageSnapshotProvider,{value:{language,t,setLanguage:()=>{}}},React.createElement(Hero,{initialMobile})),{identifierPrefix:'public-hero-'})]))]));`,
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
        const exports: { markups?: Record<string, { desktop: string; mobile: string }> } = {};
        const compiled = { exports };
        new Function("module", "exports", "require", result.outputFiles[0].text)(compiled, exports, createRequire(path.join(root, "package.json")));
        const rendered = compiled.exports;
        if (!rendered.markups?.pt?.desktop?.includes("<h1")) throw new Error("Public first paint did not render the hero");
        const templates = Object.entries(rendered.markups).flatMap(([locale,views])=>Object.entries(views).map(([viewport,markup])=>
          `<template data-public-first-paint="${locale}" data-first-paint-viewport="${viewport}">${markup}</template>`)).join("");
        const bootstrap = `${templates}<script data-public-first-paint-bootstrap>
          (function(){
            var templates=Array.from(document.querySelectorAll('template[data-public-first-paint]')),root=document.getElementById('root');
            if(location.pathname!=='/'||!root){templates.forEach(function(t){t.remove();});return;}
            var languages=['pt','en','es'],saved;
            try{saved=localStorage.getItem('sevendevx-language');}catch(e){}
            var language=languages.includes(saved)?saved:(navigator.language||'pt').toLowerCase().slice(0,2);
            if(!languages.includes(language))language='pt';
            var viewport=window.innerWidth<768?'mobile':'desktop';
            var template=templates.find(function(t){return t.getAttribute('data-public-first-paint')===language&&t.getAttribute('data-first-paint-viewport')===viewport;});
            var shell=document.createElement('div');shell.id='public-first-paint-shell';shell.style.display='contents';
            shell.appendChild(template.content);
            var video=shell.querySelector('video');if(video)video.muted=true;
            var contact=shell.querySelector('button');
            function initialContact(event){
              event.preventDefault();
              var observer=new MutationObserver(scroll);
              function scroll(){var target=document.getElementById('contact');if(target){observer.disconnect();target.scrollIntoView();}}
              observer.observe(root,{childList:true,subtree:true});scroll();setTimeout(function(){observer.disconnect();},30000);
            }
            if(contact){contact.addEventListener('click',initialContact);shell.addEventListener('public-hero:attached',function(){contact.removeEventListener('click',initialContact);},{once:true});}
            document.documentElement.lang=language==='pt'?'pt-BR':language;
            var header=document.createElement('div');header.id='public-header-root';header.style.display='contents';
            var app=document.createElement('div');app.id='public-app-root';app.style.display='contents';
            root.append(header,shell,app);templates.forEach(function(t){t.remove();});
          })();
        </script>`;
        return html.replace('<div id="root"></div>', '<div id="root"></div>' + bootstrap);
      },
    },
  };
}
