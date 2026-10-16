/** Accept only unambiguous root-relative application paths after authentication. */
export function safeAuthRedirect(value: string | null): string {
  if (!value || value.length > 4096) return "/";
  let decoded = value;
  for (let depth = 0; depth < 5; depth++) {
    if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return "/";
    let next: string;
    try { next = decodeURIComponent(decoded); } catch { return "/"; }
    if (next === decoded) return value;
    decoded = next;
  }
  return "/";
}
