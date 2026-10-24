import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { readEditorDraft, saveEditorDraft, removeEditorDraft, type EditorDraft } from '@/lib/editorDrafts';
import { useUnsavedChanges } from './useUnsavedChanges';

type Options<T> = { module: string; record: string; value: T; baseline: string; dirty: boolean; enabled?: boolean; workspace?: string };
/** Drafts never write to the server. Restoration is an explicit user decision. */
export function useEditorDraft<T>({ module, record, value, baseline, dirty, enabled = true, workspace = 'sevendevx' }: Options<T>) {
  const { user } = useAuthContext();
  const userId = user?.id;
  const scope = useMemo(() => userId ? { user: userId, workspace, module, record } : null, [userId, workspace, module, record]);
  const [candidateSlot, setCandidateSlot] = useState<{ scope: typeof scope; draft: EditorDraft<T> | null } | null>(null);
  const candidate = candidateSlot?.scope === scope ? candidateSlot.draft : null;
  const setCandidate = useCallback((draft: EditorDraft<T> | null) => setCandidateSlot({ scope, draft }), [scope]);
  const [readyScope, setReadyScope] = useState<typeof scope>(null);
  const ready = !!scope && readyScope === scope;
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const latest = useRef({ value, baseline, dirty, scope }); latest.current = { value, baseline, dirty, scope };
  const stopped = useRef<string | null>(null);
  const writes = useRef(Promise.resolve());
  useUnsavedChanges(enabled && dirty);
  useEffect(() => {
    let active = true; stopped.current = null; setReadyScope(null); setCandidate(null); setSavedAt(null); setError(null);
    if (scope && enabled) void readEditorDraft<T>(scope).then(draft => { if (active) { setCandidate(draft); setReadyScope(scope); } }).catch(() => { if (active) { setError('Rascunho local indisponível. Mantenha esta edição aberta até salvar.'); setReadyScope(scope); } });
    return () => { active = false; };
  }, [scope, enabled, setCandidate]);
  const flush = useCallback(() => {
    const snapshot = latest.current;
    if (snapshot.scope !== scope || !scope || !enabled || !ready || candidate || !snapshot.dirty || stopped.current === JSON.stringify(snapshot.value)) return;
    writes.current = writes.current.catch(() => {}).then(async () => {
      if (stopped.current === JSON.stringify(snapshot.value)) return;
      try { await saveEditorDraft(scope, snapshot.value, snapshot.baseline); setSavedAt(Date.now()); setError(null); }
      catch { setError('Não foi possível salvar o rascunho local. Salve no sistema antes de sair.'); }
    });
  }, [scope, enabled, ready, candidate]);
  useEffect(() => { const timer = setTimeout(flush, 400); return () => clearTimeout(timer); }, [value, dirty, flush]);
  useEffect(() => {
    const hidden = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush); document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', hidden); flush(); };
  }, [flush]);
  const discard = useCallback(async () => {
    stopped.current = JSON.stringify(latest.current.value); setCandidate(null); setSavedAt(null);
    await writes.current;
    if (scope) await removeEditorDraft(scope);
  }, [scope, setCandidate]);
  const restore = useCallback(() => { const next = candidate?.data; setCandidate(null); return next; }, [candidate, setCandidate]);
  return { candidate, restore, discard, clearAfterSave: discard, error, savedAt, conflict: !!candidate && candidate.baseline !== baseline };
}
