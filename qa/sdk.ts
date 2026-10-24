// Dedicated localhost QA configuration only. No production credentials or network calls.
let owner = 'qa-owner-a', sequence = 0, offline = false;
const listeners = new Set<(event: string, session: unknown) => void>();
const makeSession = () => owner ? { user: { id: owner, email: `${owner}@example.invalid` }, access_token: `header.${btoa(JSON.stringify({ session_id: owner, aal: 'aal2', sequence }))}.signature` } : null;
let session = makeSession();
export function refresh() { sequence++; session = makeSession(); listeners.forEach(listener => listener('TOKEN_REFRESHED', session)); }
export function focusAgain() { listeners.forEach(listener => listener('SIGNED_IN', session)); }
export function connectivity(value: boolean) { offline = !value; refresh(); }
export function switchOwner() { owner = owner === 'qa-owner-a' ? 'qa-owner-b' : 'qa-owner-a'; refresh(); }
export function expire() { owner = ''; session = null; listeners.forEach(listener => listener('SIGNED_OUT', null)); }
export function login() { owner = 'qa-owner-a'; refresh(); }
const query: Record<string, unknown> = {};
for (const method of ['select', 'eq', 'in', 'or', 'order', 'limit', 'insert', 'update', 'delete', 'upsert', 'maybeSingle', 'single']) query[method] = () => query;
query.then = (resolve: (value: unknown) => void) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve);
const channel = { on: () => channel, subscribe: () => channel };
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session }, error: null }),
    getUser: async () => ({ data: { user: session?.user }, error: null }),
    onAuthStateChange: (callback: (event: string, session: unknown) => void) => { listeners.add(callback); return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } }; },
    signOut: async () => { expire(); return { error: null }; },
    mfa: {
      getAuthenticatorAssuranceLevel: async () => { if (offline) throw new Error('offline'); return { data: { currentLevel: 'aal2', nextLevel: 'aal2' }, error: null }; },
      listFactors: async () => { if (offline) throw new Error('offline'); return { data: { totp: [] }, error: null }; },
    },
  },
  rpc: async (name: string) => { await new Promise(resolve => setTimeout(resolve, 30)); if (offline) throw new Error('offline'); return { data: name === 'has_role', error: null }; },
  from: () => query, channel: () => channel, removeChannel: async () => {},
  functions: { invoke: async () => ({ data: {}, error: null }) },
};
