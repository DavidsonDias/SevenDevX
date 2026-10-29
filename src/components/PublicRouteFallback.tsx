import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import { usePublicCopy } from "@/i18n/usePublicCopy";

/** Keep an already painted mobile home visible while its lazy route loads. */
export default function PublicRouteFallback({ pathname }: { pathname: string }) {
  const { copy } = usePublicCopy();
  const paintedMobileHome = pathname === "/" && typeof window !== "undefined" &&
    window.innerWidth < 768 && !!document.getElementById("public-first-paint-shell");

  if (paintedMobileHome) return <span role="status" className="sr-only">{copy("Preparando decolagem...")}</span>;
  return <AppLoaderOrbital />;
}
