/**
 * LanguageContext.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/i18n/LanguageContext.tsx
 * @module i18n
 *
 * @description
 * Contexto de idioma (pt/en/es) e função de tradução da aplicação.
 *
 * @see src/i18n/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🌐 Language Context - SevenDevX
 * Gerenciamento global do idioma da aplicação
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Language, translations, Translations } from "./translations";
import { safeStorage } from "@/utils/safeStorage";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detectar idioma do navegador
const detectBrowserLanguage = (): Language => {
  if (typeof navigator === "undefined") return "pt";
  
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("en")) return "en";
  return "pt"; // Padrão
};

// Carregar idioma salvo ou detectar
const getInitialLanguage = (): Language => {
  const saved = safeStorage.get("sevendevx-language") as Language | null;
  if (saved && ["pt", "en", "es"].includes(saved)) {
    return saved;
  }
  return detectBrowserLanguage();
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    safeStorage.set("sevendevx-language", lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
  }, []);

  // Set initial lang attribute
  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export type { Language };