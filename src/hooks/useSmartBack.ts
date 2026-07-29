/**
 * useSmartBack.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useSmartBack.ts
 * @module Hooks
 *
 * @description
 * Voltar contextual que respeita a origem da navegação.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧭 useSmartBack — Voltar inteligente
 * Se houver histórico no app (mesma origem), volta. Senão, vai para o fallback.
 * Detecta também navegações vindas de fora (sem referer interno) usando sessionStorage.
 */
import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const HISTORY_KEY = "sevendevx:nav-history";
const MAX = 25;

const readHistory = (): string[] => {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeHistory = (h: string[]) => {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-MAX)));
  } catch {
    /* storage bloqueado */
  }
};

/** Hook que registra cada navegação no sessionStorage (instalar 1x no Router root). */
export const useNavHistoryTracker = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const url = pathname + search;
    const h = readHistory();
    if (h[h.length - 1] !== url) {
      h.push(url);
      writeHistory(h);
    }
  }, [pathname, search]);
};

/** Retorna função `goBack(fallback)` que volta de verdade quando possível. */
export const useSmartBack = () => {
  const navigate = useNavigate();
  return useCallback(
    (fallback = "/admin") => {
      const h = readHistory();
      // remove a entrada atual
      const trimmed = h.slice(0, -1);
      const previous = trimmed[trimmed.length - 1];
      if (previous) {
        writeHistory(trimmed);
        navigate(previous);
        return;
      }
      // sem histórico interno → tenta browser back
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }
      navigate(fallback);
    },
    [navigate]
  );
};
