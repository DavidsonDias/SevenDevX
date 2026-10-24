/** @file src/lib/sessionContinuity.ts
 * @module Core
 * @see docs/adr/ADR-005-sevenos-session-continuity.md
 */
import type { Session } from '@supabase/supabase-js';

/** UI identity only; decoded claims never grant roles or replace server checks. */
export function sessionIdentity(session: Session | null): string {
  if (!session?.user) return '';
  try {
    const part = session.access_token.split('.')[1];
    const claims = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return `${session.user.id}:${String(claims.session_id || '')}`;
  } catch { return session.user.id; }
}

type Snapshot = { session: Session | null; isLoading: boolean; isAdmin: boolean; isRevalidating: boolean; authError: string | null };
type Dependencies = {
  readSession: () => Promise<Session | null>;
  subscribeAuth: (accept: (event: string, session: Session | null) => void) => () => void;
  checkRole: (userId: string) => Promise<boolean>;
  onAccountChange?: (previous: string | undefined, next: string | undefined) => void;
};

/** Separates initial admission from silent refresh; stale requests cannot authorize another session. */
export class SessionContinuity {
  private state: Snapshot = { session: null, isLoading: true, isAdmin: false, isRevalidating: false, authError: null };
  private listeners = new Set<() => void>();
  private revision = 0;
  private running = false;
  private checkedAt = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private unsubscribe?: () => void;
  constructor(private dependencies: Dependencies) {}
  snapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(next: Partial<Snapshot>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach(listener => listener());
  }
  start = () => {
    this.running = true;
    this.unsubscribe = this.dependencies.subscribeAuth(this.accept);
    void this.read();
    return () => { this.running = false; this.revision++; clearTimeout(this.timer); this.unsubscribe?.(); };
  };
  private async read() {
    const revision = this.revision;
    try {
      const session = await this.dependencies.readSession();
      if (this.running && revision === this.revision) this.accept('INITIAL_SESSION', session);
    } catch {
      if (this.running && revision === this.revision) this.publish({ isLoading: false, isRevalidating: false, authError: 'Não foi possível verificar a sessão. Tente novamente.' });
    }
  }
  retry = () => { if (this.state.session) this.accept('RETRY', this.state.session); else void this.read(); };
  accept = (event: string, session: Session | null) => {
    if (!this.running) return;
    const previous = this.state.session;
    const sameIdentity = !!session && sessionIdentity(previous) === sessionIdentity(session);
    const unchangedToken = sameIdentity && previous?.access_token === session?.access_token;
    if (previous?.user.id !== session?.user.id) this.dependencies.onAccountChange?.(previous?.user.id, session?.user.id);
    if (!session) {
      this.revision++; clearTimeout(this.timer); this.checkedAt = 0;
      this.publish({ session: null, isAdmin: false, isLoading: false, isRevalidating: false, authError: null });
      return;
    }
    // Duplicate INITIAL_SESSION/SIGNED_IN events do not restart admission or its RPC.
    if (unchangedToken && event !== 'RETRY' && (this.state.isRevalidating || (!this.state.authError && Date.now() - this.checkedAt < 30_000))) {
      this.publish({ session }); return;
    }
    const revision = ++this.revision;
    clearTimeout(this.timer);
    const initial = !sameIdentity || this.state.isLoading;
    this.publish({ session, isLoading: initial, isAdmin: sameIdentity ? this.state.isAdmin : false, isRevalidating: true, authError: null });
    // Supabase callbacks stay synchronous: API work starts after the SDK lock is released.
    this.timer = setTimeout(() => { void (async () => {
      let deadline: ReturnType<typeof setTimeout> | undefined;
      try {
        const admin = await Promise.race([
          this.dependencies.checkRole(session.user.id),
          new Promise<never>((_, reject) => { deadline = setTimeout(() => reject(new Error('role timeout')), 12_000); }),
        ]);
        if (this.running && revision === this.revision) {
          this.checkedAt = Date.now();
          this.publish({ isAdmin: admin, isLoading: false, isRevalidating: false, authError: null });
        }
      } catch {
        if (this.running && revision === this.revision) this.publish({ isLoading: false, isRevalidating: false, authError: 'Não foi possível atualizar as permissões. Verifique a conexão e tente novamente.' });
      } finally { clearTimeout(deadline); }
    })(); }, 0);
  };
}
