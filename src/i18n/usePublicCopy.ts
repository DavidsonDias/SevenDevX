import { useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { formatPublicMessage, translatePublicText } from "./publicCopy";

/** Presentation-only localization. Does not mutate CMS records, query caches or business identifiers. */
export function usePublicCopy() {
  const { language } = useLanguage();
  const copy = useCallback(<T,>(value: T): T => translatePublicText(value, language), [language]);
  const message = useCallback((template: string, values: Record<string, string | number>) => formatPublicMessage(template, values, language), [language]);
  return { copy, message, language };
}
