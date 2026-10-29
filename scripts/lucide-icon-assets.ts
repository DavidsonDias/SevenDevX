import type { Plugin } from "vite";
import { icons, type LucideIcon } from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { build } from "esbuild";
import catalog from "../src/data/lucideIconAssets.json";

/** Resolve dynamic icons at build time; keep the complete picker in the admin bundle. */
export function lucideIconAssets(): Plugin {
  const drawings = new Map<string, LucideIcon>(Object.entries(icons).map(([name, Icon]) => [catalog.names[name as keyof typeof catalog.names], Icon]));
  const svg = (name: string) => {
    const Icon = drawings.get(name);
    if (!Icon) return null;
    const body = renderToStaticMarkup(createElement(Icon)).match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)?.[1];
    if (!body) throw new Error(`Missing Lucide drawing: ${name}`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- Lucide ${catalog.version}; ISC; see LICENSE.txt --><g id="icon">${body}</g></svg>`;
  };
  return {
    name: "sevendevx-lucide-icon-assets",
    enforce: "pre",
    // Keep the synchronous desktop/admin namespace separate from named icons.
    // Otherwise Rollup's shared-module graph hoists every drawing into the
    // public navigation chunk, even when the namespace consumer is lazy.
    transform(source, id) {
      if (!/\/components\/(ui\/LucideIconRender|admin\/LucideIconPicker)\.tsx$/.test(id.replaceAll("\\", "/"))) return;
      return source.replace(/import \{ icons,([^}]+)\} from "lucide-react";/,
        'import { icons } from "virtual:sevendevx-lucide-catalog";\nimport {$1} from "lucide-react";');
    },
    resolveId(id) {
      if (id === "virtual:sevendevx-lucide-catalog") return "\0sevendevx-lucide-catalog";
    },
    async load(id) {
      if (id !== "\0sevendevx-lucide-catalog") return;
      const result = await build({stdin:{contents:'export { icons } from "lucide-react";',resolveDir:process.cwd()},bundle:true,write:false,format:"esm",platform:"browser",external:["react"],minify:true});
      return result.outputFiles[0].text;
    },
    configureServer(server) {
      server.middlewares.use((req,res,next) => {
        const match = req.url?.match(new RegExp(`^/lucide-icons/${catalog.version.replaceAll(".","\\.")}/([A-Za-z0-9]+)\\.svg$`));
        const source = match && svg(match[1]);
        if (!source) return next();
        res.setHeader("Content-Type","image/svg+xml");res.end(source);
      });
    },
    generateBundle() {
      for (const name of drawings.keys()) this.emitFile({type:"asset",fileName:`lucide-icons/${catalog.version}/${name}.svg`,source:svg(name)!});
      this.emitFile({type:"asset",fileName:`lucide-icons/${catalog.version}/LICENSE.txt`,source:readFileSync("node_modules/lucide-react/LICENSE","utf8")});
    },
  };
}
