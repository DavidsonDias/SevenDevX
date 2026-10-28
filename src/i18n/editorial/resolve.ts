import type { GeoArticle } from "@/data/geoContent";
import type { Language } from "../translations";
import type { ArticleCopy } from "./types";
import { articlesEn } from "./en";
import { articlesEs } from "./es";
import { articleRevisions } from "./revisions";

/** Change detector for editorial drift, not a security/cryptographic hash. */
export function articleFingerprint(article: GeoArticle): string {
  const content = JSON.stringify({
    title: article.title, question: article.question, shortAnswer: article.shortAnswer,
    summary: article.summary, sections: article.sections, faq: article.faq, keywords: article.keywords,
  });
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++) hash = Math.imul(hash ^ content.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

function completeCopy(copy: ArticleCopy | undefined, source: GeoArticle): copy is ArticleCopy {
  return !!copy && [copy.title, copy.question, copy.shortAnswer, copy.summary].every(s => typeof s === "string" && s.trim())
    && copy.sections.length === source.sections.length && copy.faq.length === source.faq.length
    && copy.sections.every(s => s.heading.trim() && s.body.trim())
    && copy.faq.every(f => f.q.trim() && f.a.trim()) && copy.keywords.length > 0;
}

/** Whole-article fallback prevents translated headings sitting over an outdated Portuguese body. */
export function resolveGeoArticle(source: GeoArticle, requested: Language): { article: GeoArticle; language: Language } {
  if (requested === "pt") return { article: source, language: "pt" };
  const copy = (requested === "en" ? articlesEn : articlesEs)[source.slug];
  if (articleRevisions[source.slug] !== articleFingerprint(source) || !completeCopy(copy, source)) {
    return { article: source, language: "pt" };
  }
  return { article: { ...source, ...copy }, language: requested };
}
