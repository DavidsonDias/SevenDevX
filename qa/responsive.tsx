/* Local synthetic responsive fixture. No backend writes or real credentials. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AppViewport from '@/components/AppViewport';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import '@/index.css';
function Fixture() {
  return <><AppViewport /><AdminPageShell title="Validação responsiva" subtitle="Dados sintéticos, sem gravação" actions={<>{Array.from({length:8},(_,i)=><button key={i} className="border p-3">Ação {i+1}</button>)}</>}>
    <Dialog><DialogTrigger className="border p-3">Abrir formulário de teste</DialogTrigger><DialogContent><DialogTitle>Formulário longo</DialogTitle>
      {Array.from({length:18},(_,i)=><label key={i}>Campo {i+1}<input className="block w-full min-w-0 p-3 border bg-black" /></label>)}
      <DialogFooter><DialogClose className="border p-3">Cancelar teste</DialogClose><DialogClose className="border p-3">Concluir teste</DialogClose></DialogFooter>
    </DialogContent></Dialog>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">{Array.from({length:12},(_,i)=><div key={i} className="min-w-0 border p-4">Indicador {i+1}</div>)}</div>
  </AdminPageShell></>;
}
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><AuthProvider><BrowserRouter><Fixture /></BrowserRouter></AuthProvider></QueryClientProvider>);
