import { useLayoutEffect, useRef } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { LanguageSnapshotProvider, useLanguage } from "@/i18n/LanguageContext";
import HeroContent from "./HeroContent";

/** Reuse the build-rendered public hero instead of destroying its first paint.
 * All subsequent visits without that HTML use normal React rendering.
 * This island has no auth or customer state; language remains owned by the app.
 */
export default function Hero() {
  const language = useLanguage();
  const shell = useRef(typeof document === "undefined" ? null : document.getElementById("public-first-paint-shell"));
  const island = useRef<Root | null>(null);
  const currentLanguage = useRef(language.language);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const element = shell.current;
    if (!element) return;
    mounted.current = true;
    if (!island.current) {
      island.current = hydrateRoot(element,
        <LanguageSnapshotProvider value={language}><HeroContent /></LanguageSnapshotProvider>,
        { identifierPrefix: "public-hero-" });
      element.dispatchEvent(new Event("public-hero:attached"));
    } else if (currentLanguage.current !== language.language) {
      island.current.render(<LanguageSnapshotProvider value={language}><HeroContent /></LanguageSnapshotProvider>);
    }
    currentLanguage.current = language.language;
    return () => {
      mounted.current = false;
      // StrictMode runs setup/cleanup/setup synchronously. Only destroy the
      // independent root after a real removal, outside the parent's commit.
      queueMicrotask(() => {
        if (!mounted.current) {
          island.current?.unmount();
          island.current = null;
          element.remove();
        }
      });
    };
  }, [language]);

  return shell.current ? null : <HeroContent />;
}
