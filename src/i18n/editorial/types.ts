import type { GeoArticle } from "@/data/geoContent";

/** Full-article translations: structural identifiers remain owned by the Portuguese source. */
export type ArticleCopy = Pick<GeoArticle, "title" | "question" | "shortAnswer" | "summary" | "sections" | "faq" | "keywords">;
export type ArticleCatalogue = Record<string, ArticleCopy>;

export function articleCopy(
  title: string, question: string, shortAnswer: string, summary: string,
  sections: readonly (readonly [string, string])[],
  faq: readonly (readonly [string, string])[], keywords: string[],
): ArticleCopy {
  return { title, question, shortAnswer, summary, sections: sections.map(([heading, body]) => ({ heading, body })), faq: faq.map(([q, a]) => ({ q, a })), keywords };
}
