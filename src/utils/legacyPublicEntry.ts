/** Mirrors the hosting aliases when an installed PWA serves its cached shell first. */
export function legacyPublicEntry({ pathname, search = "", hash = "" }: { pathname: string; search?: string; hash?: string }): string | null {
  if (pathname !== "/index.html" && pathname !== "/home") return null;
  return hash === "#contact" ? `/contact${search}` : `/${search}${hash}`;
}
