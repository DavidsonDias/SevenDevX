/** In-app destinations only; ProtectedRoute and database RLS remain authoritative. */
export function notificationPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^\/admin(?:[/?]|$)/.test(value) ||
    /[\\\r\n]/.test(value)
  )
    return "/admin/notifications";
  try {
    const u = new URL(value, "https://www.sevendevx.com");
    return u.origin === "https://www.sevendevx.com" && /^\/admin(?:\/|$)/.test(u.pathname)
      ? u.pathname + u.search
      : "/admin/notifications";
  } catch {
    return "/admin/notifications";
  }
}
