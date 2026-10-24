type Props = { available: boolean; conflict?: boolean; error?: string | null; savedAt?: number | null; onRestore: () => void; onDiscard: () => void };
/** Explicit recovery; this notice never mutates a remote record. */
export default function EditorDraftNotice({ available, conflict, error, savedAt, onRestore, onDiscard }: Props) {
  if (available) return <div className="border border-white/20 rounded-lg p-3 space-y-2 text-sm" role="status">
    <p>Encontramos alterações não salvas. Deseja continuar de onde parou?</p>
    {conflict && <p>O registro mudou desde este rascunho. Revise os dados antes de salvar.</p>}
    <div className="flex gap-3"><button type="button" className="min-h-11 underline" onClick={onRestore}>Restaurar alterações</button><button type="button" className="min-h-11 underline" onClick={onDiscard}>Descartar rascunho</button></div>
  </div>;
  return error ? <p role="status" className="text-amber-300 text-sm">{error}</p> : savedAt ? <p role="status" className="text-xs text-white/50">Rascunho salvo neste dispositivo.</p> : null;
}
