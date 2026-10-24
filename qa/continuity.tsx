import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminPageShell from '@/components/admin/AdminPageShell';
import EditorDraftNotice from '@/components/EditorDraftNotice';
import UnsavedNavigationGuard from '@/components/UnsavedNavigationGuard';
import AppViewport from '@/components/AppViewport';
import { useEditorDraft } from '@/hooks/useEditorDraft';
import { saveEditorDraft, readEditorDraft, clearUserDrafts, encodeDraft } from '@/lib/editorDrafts';
import { refresh, focusAgain, connectivity, switchOwner, expire, login } from './sdk';
import '@/index.css';
let mounts = 0;
function Editor() {
  const [mount] = useState(() => ++mounts);
  const [value, setValue] = useState('');
  const draft = useEditorDraft({ module: 'qa-continuity', record: 'sample', value, baseline: 'v1', dirty: value !== '' });
  return <AdminPageShell title="Edição sintética — nenhum dado real">
    <p data-testid="mount-count">Montagem do editor: {mount}</p>
    <EditorDraftNotice available={!!draft.candidate} conflict={draft.conflict} error={draft.error} savedAt={draft.savedAt}
      onRestore={() => { const data = draft.restore(); if (data !== undefined) setValue(data); }} onDiscard={() => void draft.discard()} />
    <label className="block mt-4" htmlFor="qa-draft">Texto de teste não salvo</label>
    <input id="qa-draft" value={value} onChange={event => setValue(event.target.value)} className="border border-white/40 bg-black text-white p-3 w-full" />
    <button className="border rounded p-3 my-4" onClick={() => { setValue(''); void draft.discard(); }}>Limpar teste</button>
    {Array.from({ length: 40 }, (_, i) => <p key={i} className="py-4 border-b border-white/10">Conteúdo de rolagem {i + 1}</p>)}
  </AdminPageShell>;
}
function Fixture() {
  const { user, isRevalidating, authError } = useAuthContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [checks, setChecks] = useState('');
  const storageChecks = async () => {
    const owner = `qa-storage-${crypto.randomUUID()}`;
    const scope = { user: owner, workspace: 'qa', module: 'fixture', record: 'one' };
    try {
      await saveEditorDraft(scope, { text: 'synthetic' }, 'revision-one');
      if ((await readEditorDraft<{ text: string }>(scope))?.data.text !== 'synthetic') throw new Error();
      if (await readEditorDraft({ ...scope, user: owner + '-other' })) throw new Error();
      if (await readEditorDraft({ ...scope, workspace: 'other' })) throw new Error();
      let rejected = false; try { encodeDraft({ password: 'synthetic' }); } catch { rejected = true; }
      if (!rejected) throw new Error();
      await clearUserDrafts(owner);
      if (await readEditorDraft(scope)) throw new Error();
      setChecks('5 verificações de rascunho aprovadas: leitura, usuário, organização, credenciais e logout.');
    } catch { setChecks('Falha na validação local de rascunhos.'); }
  };
  return <>
    <div style={{ position: 'relative', zIndex: 300, padding: 12, color: 'white', background: '#18181b', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <span>QA local · {user?.id || 'sem sessão'} · {isRevalidating ? 'revalidando' : 'estável'}</span>
      {authError && <span role="status">{authError}</span>}
      <button onClick={refresh}>Renovar token</button><button onClick={focusAgain}>Repetir foco</button>
      <button onClick={() => connectivity(false)}>Simular rede instável</button><button onClick={() => connectivity(true)}>Restaurar rede</button>
      <button onClick={switchOwner}>Trocar usuário</button><button onClick={expire}>Expirar sessão</button><button onClick={() => { login(); navigate("/admin/continuity-check", { replace: true }); }}>Entrar novamente</button>
      <button onClick={storageChecks}>Verificar isolamento</button><span>{checks}</span>
    </div>
    <UnsavedNavigationGuard /><AppViewport />
    {pathname === '/auth' ? <p>Sessão expirada: use Entrar novamente para recuperar seu rascunho.</p> : <ProtectedRoute requiredRole="admin"><Editor /></ProtectedRoute>}
  </>;
}
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AuthProvider><BrowserRouter><Fixture /></BrowserRouter></AuthProvider></QueryClientProvider>);
