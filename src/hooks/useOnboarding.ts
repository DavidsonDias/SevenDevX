/**
 * useOnboarding.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useOnboarding.ts
 * @module Hooks
 *
 * @description
 * Progresso do checklist e do tour de onboarding.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎯 useOnboarding — track tour progress per user.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export function useOnboarding(tourKey: string) {
  const { user } = useAuthContext();
  const [progress, setProgress] = useState<{ completed_steps: string[]; dismissed_at: string | null; completed_at: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("onboarding_progress")
        .select("completed_steps,dismissed_at,completed_at")
        .eq("user_id", user.id).eq("tour_key", tourKey).maybeSingle();
      setProgress(data ?? { completed_steps: [], dismissed_at: null, completed_at: null });
      setLoading(false);
    })();
  }, [user, tourKey]);

  const upsert = useCallback(async (patch: any) => {
    if (!user) return;
    await supabase.from("onboarding_progress").upsert({
      user_id: user.id, tour_key: tourKey,
      completed_steps: patch.completed_steps ?? progress?.completed_steps ?? [],
      dismissed_at: patch.dismissed_at !== undefined ? patch.dismissed_at : progress?.dismissed_at ?? null,
      completed_at: patch.completed_at !== undefined ? patch.completed_at : progress?.completed_at ?? null,
    } as any, { onConflict: "user_id,tour_key" });
    setProgress((p) => ({ ...(p ?? { completed_steps: [], dismissed_at: null, completed_at: null }), ...patch }));
  }, [user, tourKey, progress]);

  const completeStep = (stepId: string) => {
    const set = new Set([...(progress?.completed_steps ?? []), stepId]);
    upsert({ completed_steps: Array.from(set) });
  };
  const dismiss = () => upsert({ dismissed_at: new Date().toISOString() });
  const reset = () => upsert({ completed_steps: [], dismissed_at: null, completed_at: null });
  const complete = () => upsert({ completed_at: new Date().toISOString() });

  return { progress, loading, completeStep, dismiss, reset, complete };
}
