// No arbitrary origins: subscriptions are capabilities, not user-provided fetch URLs.
export function validPushEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      !u.hash &&
      /^(fcm\.googleapis\.com|([a-z0-9-]+\.)?push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)$/.test(
        u.hostname,
      ) &&
      u.pathname !== "/"
    );
  } catch {
    return false;
  }
}
export function safeNotificationPath(value: unknown) {
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
export function retryDecision(status: number, attempt: number) {
  if (status === 404 || status === 410)
    return { state: "expired", code: "subscription_expired", retry: false };
  const retry =
    attempt < 3 &&
    (status === 0 || status === 408 || status === 429 || status >= 500);
  return {
    state: retry ? "pending" : "failed",
    code: status === 0 ? "transport_error" : `push_http_${status}`,
    retry,
  };
}
