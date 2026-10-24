/** @file src/lib/pwaUpdateSafety.ts
 * @module Core
 * @see docs/adr/ADR-005-sevenos-session-continuity.md
 */
import { hasUnsavedEdits } from './unsavedChanges';

/** Coordination carries edit booleans only. Other tabs never receive a reload command. */
const pending = new Map<string, { blocked: boolean }>();
let channel: BroadcastChannel | undefined;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel('sevenos-update-safety-v1');
    channel.onmessage = ({ data }) => {
      if (typeof data?.id !== 'string' || data.id.length > 100) return;
      if (data.type === 'check') channel?.postMessage({ type: 'state', id: data.id, dirty: hasUnsavedEdits() });
      if (data.type === 'state' && data.dirty === true) {
        const check = pending.get(data.id); if (check) check.blocked = true;
      }
    };
  }
} catch { /* Updates still require local approval if cross-tab messaging is unavailable. */ }

export async function canApplyPwaUpdate() {
  if (hasUnsavedEdits()) return false;
  if (!channel) return true;
  const id = crypto.randomUUID(), check = { blocked: false };
  pending.set(id, check);
  try {
    channel.postMessage({ type: 'check', id });
    await new Promise(resolve => setTimeout(resolve, 350));
    return !check.blocked && !hasUnsavedEdits();
  } finally { pending.delete(id); }
}
