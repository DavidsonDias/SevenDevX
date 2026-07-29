/**
 * BreadcrumbSchema.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/BreadcrumbSchema.tsx
 * @module UI
 *
 * @description
 * Emite JSON-LD BreadcrumbList para a rota atual, reforçando a trilha de navegação para buscadores e LLMs.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { Helmet } from "react-helmet";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * 🧭 BreadcrumbSchema — injeta BreadcrumbList JSON-LD para AI search e Google.
 * Use em qualquer página com hierarquia clara (cases, answers, solucoes, local).
 */
export default function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  if (!items?.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `https://www.sevendevx.com${it.url}`,
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
