/** @file src/lib/unsavedChanges.ts
 * @module Core
 * @see docs/adr/ADR-005-sevenos-session-continuity.md
 */
/** Shared edit registry; contains booleans only, never form contents or credentials. */
const edits = new Set<symbol>();
export function registerUnsavedEdit(key: symbol, dirty: boolean) {
  if (dirty) edits.add(key); else edits.delete(key);
}
export function hasUnsavedEdits() { return edits.size > 0; }
export function confirmLeaveEdits() {
  return !hasUnsavedEdits() || window.confirm('Há alterações não salvas. Deseja sair desta edição?');
}
