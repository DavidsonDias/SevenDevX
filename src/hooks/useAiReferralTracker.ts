/**
 * useAiReferralTracker.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useAiReferralTracker.ts
 * @module Hooks
 *
 * @description
 * Registra visitas originadas de assistentes de IA para a análise GEO.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🛰️ useAiReferralTracker
 * Detecta quando uma visita veio de ChatGPT, Perplexity, Gemini, Claude, Copilot, etc.
 * Estratégias:
 *   1. document.referrer com hostname conhecido (chat.openai.com, perplexity.ai, gemini.google.com…)
 *   2. UTM source/medium (utm_source=chatgpt, ref=perplexity…)
 *   3. Parâmetros específicos de cada engine
 * Registra em `ai_referrals` (uma vez por sessão por engine).
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSafeId } from "@/utils/safeStorage";

const AI_SOURCES: { id: string; match: (ref: string, search: URLSearchParams) => boolean }[] = [
  { id: "chatgpt",     match: (r, s) => /chat\.openai\.com|chatgpt\.com/i.test(r) || s.get("utm_source") === "chatgpt" || s.get("ref") === "chatgpt" },
  { id: "perplexity",  match: (r, s) => /perplexity\.ai/i.test(r) || s.get("utm_source") === "perplexity" },
  { id: "gemini",      match: (r, s) => /gemini\.google\.com|bard\.google\.com/i.test(r) || s.get("utm_source") === "gemini" },
  { id: "claude",      match: (r, s) => /claude\.ai/i.test(r) || s.get("utm_source") === "claude" },
  { id: "copilot",     match: (r, s) => /copilot\.microsoft\.com|bing\.com\/chat/i.test(r) || s.get("utm_source") === "copilot" },
  { id: "you",         match: (r, s) => /you\.com/i.test(r) || s.get("utm_source") === "you" },
  { id: "meta-ai",     match: (r, s) => /meta\.ai/i.test(r) || s.get("utm_source") === "meta-ai" },
  { id: "phind",       match: (r, s) => /phind\.com/i.test(r) || s.get("utm_source") === "phind" },
  { id: "deepseek",    match: (r, s) => /deepseek\.com/i.test(r) || s.get("utm_source") === "deepseek" },
];

const SESSION_KEY = "sevendevx_ai_referrals_logged";

function getLogged(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markLogged(id: string) {
  try {
    const s = getLogged();
    s.add(id);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...s]));
  } catch { /* noop */ }
}

export function useAiReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const referrer = document.referrer || "";
    const params = new URLSearchParams(window.location.search);

    const matched = AI_SOURCES.find((s) => s.match(referrer, params));
    if (!matched) return;

    const logged = getLogged();
    if (logged.has(matched.id)) return;

    const visitor_id = getOrCreateSafeId("sevendevx_visitor_id", "visitor", "local");
    const session_id = getOrCreateSafeId("sevendevx_session_id", "session", "session");
    const query_hint = params.get("q") || params.get("query") || params.get("utm_term") || null;

    supabase
      .from("ai_referrals" as any)
      .insert({
        ai_source: matched.id,
        landing_path: location.pathname,
        referrer: referrer || null,
        visitor_id,
        session_id,
        user_agent: navigator.userAgent,
        query_hint,
      })
      .then(({ error }) => {
        if (!error) markLogged(matched.id);
      });
  }, [location.pathname]);
}
