import type { Language } from "../translations";
import { blogCatalogue } from "./blogCatalogue";

export interface BlogSource { slug: string; title: string; excerpt: string | null; content: string }
export function blogFingerprint(source: BlogSource): string {
  const value = JSON.stringify({ title: source.title, excerpt: source.excerpt, content: source.content });
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}
export function resolveBlogPost<T extends BlogSource>(source: T, requested: Language): { post: T; language: Language } {
  const fallback = { post: source, language: "pt" as const };
  if (requested === "pt") return fallback;
  const entry = blogCatalogue[source.slug];
  if (!entry || entry.revision !== blogFingerprint(source)) return fallback;
  const [title, excerpt, template] = entry[requested];
  if (![title, excerpt, template].every(s => s.trim())) return fallback;
  const code = source.content.match(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm) ?? [];
  const markers = [...template.matchAll(/\{\{code:(\d+)\}\}/g)].map(m => Number(m[1]));
  // Every code example must be present once, in its original order.
  if (markers.length !== code.length || markers.some((n, i) => n !== i)) return fallback;
  const content = template.replace(/\{\{code:(\d+)\}\}/g, (_, n: string) => code[Number(n)]);
  return { post: { ...source, title, excerpt, content }, language: requested };
}
