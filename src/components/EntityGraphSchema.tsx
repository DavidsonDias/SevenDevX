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
