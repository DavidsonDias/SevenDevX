/**
 * EntityGraphSchema.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/EntityGraphSchema.tsx
 * @module UI
 *
 * @description
 * Publica o grafo de entidades (JSON-LD) que sustenta a estratégia GEO da marca.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { Helmet } from "react-helmet";
import { buildEntityJsonLd } from "@/data/entityGraph";

/**
 * 🧠 EntityGraphSchema — injeta @graph completo de entidades SevenDevX em JSON-LD.
 * Complementa GeoKnowledgeGraph com relacionamentos explícitos entre serviços,
 * tecnologias, pessoas e conceitos — usado por LLMs para entity recognition.
 */
export default function EntityGraphSchema() {
  const graph = buildEntityJsonLd();
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(graph)}</script>
    </Helmet>
  );
}
