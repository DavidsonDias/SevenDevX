import type { Plugin } from "vite";
import * as icons from "react-icons/si";
import catalog from "../src/data/techIconAssets.json";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Build-time only. Ship individual SVGs, never the complete icon library as JavaScript. */
export function techIconAssets(): Plugin {
  return {
    name: "sevendevx-tech-icon-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(new RegExp(`^/tech-icons/${catalog.version.replaceAll(".", "\\.")}/(Si[A-Za-z0-9]+)\\.svg$`));
        const Icon = match && (icons as Record<string, typeof icons.SiReact>)[match[1]];
        if (!Icon) return next();
        res.setHeader("Content-Type", "image/svg+xml");
        res.end(renderToStaticMarkup(createElement(Icon)));
      });
    },
    generateBundle() {
      for (const [name, Icon] of Object.entries(icons)) {
        if (!/^Si[A-Za-z0-9]+$/.test(name)) continue;
        this.emitFile({ type: "asset", fileName: `tech-icons/${catalog.version}/${name}.svg`, source: renderToStaticMarkup(createElement(Icon)) });
      }
    },
  };
}
