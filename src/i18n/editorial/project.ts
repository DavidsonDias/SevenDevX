import type { Language } from "../translations";
import { projectCopy } from "../publicProjectCopy";
import { projectDetailsCopy } from "../publicProjectDetailsCopy";
const catalogue = { ...projectCopy, ...projectDetailsCopy };
export function resolveProjectText<T extends { description: string; longDescription?: string }>(source: T, requested: Language): { project: T; language: Language } {
  const fallback = { project: source, language: "pt" as const };
  if (requested === "pt") return fallback;
  const short = catalogue[source.description];
  const long = source.longDescription ? catalogue[source.longDescription] : undefined;
  if (!short || (source.longDescription && !long)) return fallback;
  const index = requested === "en" ? 0 : 1;
  return { project: { ...source, description: short[index], longDescription: long?.[index] }, language: requested };
}
