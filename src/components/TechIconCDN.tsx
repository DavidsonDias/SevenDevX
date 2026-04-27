/**
 * 🎨 TechIconCDN — Renders OFFICIAL brand-colored tech icons
 *
 * Uses `react-icons/si` (Simple Icons) bundled locally — no CDN dependency,
 * no Service Worker interference, no CORS or 404 fallbacks. Each icon is a
 * real SVG React component painted with its true brand color.
 *
 * The slug (e.g. "react", "typescriptreact", "tailwindcss", "nodedotjs")
 * maps to the `Si*` component name (PascalCase, prefixed with "Si").
 *
 * If the slug doesn't resolve to a known icon, we render a colored letter
 * badge as a graceful fallback (using the `color` prop or a default tint).
 */
import * as SiIcons from "react-icons/si";
import type { IconType } from "react-icons";
import { Code2 } from "lucide-react";

interface TechIconCDNProps {
  slug: string;
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

/** Slug aliases → Simple Icons slugs (when registry slug differs from the SI name). */
const SLUG_ALIASES: Record<string, string> = {
  html: "html5",
  css: "css3",
  js: "javascript",
  ts: "typescript",
  java: "openjdk",
  openjdk: "openjdk",
  csharp: "sharp",
  "c-sharp": "sharp",
  "c#": "sharp",
  cpp: "cplusplus",
  "c++": "cplusplus",
  dotnet: "dotnet",
  ".net": "dotnet",
  nodejs: "nodedotjs",
  "node.js": "nodedotjs",
  node: "nodedotjs",
  vuejs: "vuedotjs",
  "vue.js": "vuedotjs",
  nextjs: "nextdotjs",
  "next.js": "nextdotjs",
  nuxtjs: "nuxtdotjs",
  expressjs: "express",
  jest: "jest",
  tailwind: "tailwindcss",
  "tailwind-css": "tailwindcss",
  postgres: "postgresql",
  gcp: "googlecloud",
  "google-cloud": "googlecloud",
  aws: "amazonwebservices",
  amazonaws: "amazonwebservices",
  "amazon-web-services": "amazonwebservices",
  vscode: "vscodium",
  "vs-code": "vscodium",
  shadcn: "shadcnui",
  "shadcn-ui": "shadcnui",
  materialui: "mui",
  "material-ui": "mui",
  socketio: "socketdotio",
  "socket.io": "socketdotio",
  githubactions: "githubactions",
  "github-actions": "githubactions",
  kafka: "apachekafka",
  scikit: "scikitlearn",
  "scikit-learn": "scikitlearn",
};

/**
 * Convert a slug like "tailwindcss" → "SiTailwindcss", "d3dotjs" → "SiD3Dotjs".
 * Rule (matches react-icons/si convention): capitalize the first letter, and
 * also capitalize any letter immediately following a digit.
 */
const slugToComponentName = (slug: string): string => {
  const normalized = (SLUG_ALIASES[slug.toLowerCase()] || slug.toLowerCase())
    .replace(/[^a-z0-9]/g, "");
  if (!normalized) return "";
  const head = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const cased = head.replace(/(\d)([a-z])/g, (_, d, l) => `${d}${l.toUpperCase()}`);
  return "Si" + cased;
};

export const TechIconCDN = ({ slug, name, color, size = 20, className = "" }: TechIconCDNProps) => {
  const compName = slug ? slugToComponentName(slug) : "";
  const IconComp = (SiIcons as unknown as Record<string, IconType>)[compName];

  if (!IconComp) {
    const fallbackColor = color || "#8B5CF6";
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md ${className}`}
        style={{
          width: size,
          height: size,
          background: `${fallbackColor}22`,
          color: fallbackColor,
          border: `1px solid ${fallbackColor}55`,
        }}
        aria-label={name}
      >
        <Code2 style={{ width: Math.max(12, size * 0.62), height: Math.max(12, size * 0.62) }} />
      </span>
    );
  }

  return (
    <IconComp
      title={name}
      aria-label={name}
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size, color: color || undefined }}
    />
  );
};

export default TechIconCDN;
