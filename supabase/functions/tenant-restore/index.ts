/**
 * 🚀 tenant-restore/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/tenant-restore/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `tenant-restore` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `restore_jobs`, `tenant_backups`, `backups`
 * ✅ Invoca RPC: `has_role`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `tenant-restore`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ O papel administrativo é verificado via RPC `has_role` (SECURITY DEFINER)
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 * 🔒 Arquivos privados são servidos por signed URL, nunca por URL pública
 * 💾 Bucket(s) utilizados: `backups`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 A autoridade final é a RLS do banco, não o corpo da requisição
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚡ tenant-restore/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/tenant-restore/index.ts
 * @module Restore
 *
 * @description
 * Restaura dados a partir de um backup.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * —
 *
 * @remarks
 * Operação destrutiva: exige confirmação explícita e é auditada.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// Selective tenant restore. Admin only. Reads JSON snapshot, upserts selected tables.
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { decodeSnapshot } from './snapshot.ts';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' };

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Whitelist of restorable tables — avoid touching auth/system.
const RESTORABLE = new Set([
  'projects', 'clients', 'contacts', 'transactions', 'project_budgets',
  'services_cms', 'faq_items', 'faq_categories', 'blog_posts', 'blog_categories',
  'tech_registry', 'tag_registry', 'response_templates', 'automations',
  'process_templates', 'process_template_stages',
]);

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 Arquivos privados são acessados apenas por URL assinada temporária — nunca URL pública.
// ⚠️ URLs assinadas expiram; não devem ser persistidas como valor permanente.
//

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: corsHeaders });
  let supa: ReturnType<typeof createClient> | undefined;
  let jobId: string | undefined;
  let totalInserted = 0;
  const log: any[] = [];
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin, error: roleError } = await uc.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (roleError || isAdmin !== true) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });

    const { backup_id, source_url, selected_tables, mode, confirmed } = await req.json();
    if (confirmed !== true) return new Response(JSON.stringify({ error: 'explicit_confirmation_required' }), { status: 400, headers: corsHeaders });
    if (typeof backup_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(backup_id) || source_url || (mode && mode !== 'merge')) return new Response(JSON.stringify({ error: 'invalid_source_or_mode' }), { status: 400, headers: corsHeaders });
    if (!Array.isArray(selected_tables) || selected_tables.some(t => typeof t !== 'string' || !RESTORABLE.has(t))) return new Response(JSON.stringify({ error: 'invalid_tables' }), { status: 400, headers: corsHeaders });
    const tables = [...new Set<string>(selected_tables)];
    if (!tables.length) return new Response(JSON.stringify({ error: 'no_valid_tables' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: b, error: backupError } = await supa.from('tenant_backups').select('storage_path,size_bytes,metadata').eq('id', backup_id).single();
    if (backupError || typeof b?.storage_path !== 'string' || !b.storage_path) throw new Error('Backup lookup failed');
    if (typeof b.size_bytes !== 'number' || !(b.size_bytes > 0 && b.size_bytes <= 32 * 1024 * 1024)) throw new Error('Backup size unsupported');
    const { data: blob, error: downloadError } = await supa.storage.from('backups').download(b.storage_path);
    if (downloadError || !blob || blob.size > 32 * 1024 * 1024) throw new Error('Backup download failed');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const metadata = b.metadata;
    const expectedHash = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>).checksum_sha256 : undefined;
    if (expectedHash !== undefined && (typeof expectedHash !== 'string' || !/^[0-9a-f]{64}$/.test(expectedHash))) throw new Error('Backup checksum invalid');
    if (expectedHash) {
      const actual = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
      if (actual !== expectedHash) throw new Error('Backup integrity failed');
    }
    // Validate all selected snapshots before the first database write.
    const snapshot = decodeSnapshot(bytes, tables);
    const { data: job, error: jobError } = await supa.from('restore_jobs').insert({
      backup_id, selected_tables: tables, mode: 'merge', status: 'running', executed_by: u.user.id,
    }).select().single();
    if (jobError || typeof job?.id !== 'string' || !job.id) throw new Error('Restore job creation failed');
    const runningJobId = job.id;
    jobId = runningJobId;
    for (const t of tables) {
      const rows = Array.isArray(snapshot[t]) ? snapshot[t] : [];
      if (!rows.length) { log.push({ table: t, inserted: 0, skipped: true }); continue; }
      // upsert in chunks of 100
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error, count } = await supa.from(t).upsert(chunk, { onConflict: 'id', count: 'exact' });
        if (error) { log.push({ table: t, inserted, error: 'Table write failed' }); throw new Error('Table write failed'); }
        const written = count ?? chunk.length;
        inserted += written;
        totalInserted += written;
      }
      log.push({ table: t, inserted });
      const { error: progressError } = await supa.from('restore_jobs').update({ inserted_rows: totalInserted, log }).eq('id', runningJobId);
      if (progressError) throw new Error('Progress persistence failed');
    }

    const { error: completionError } = await supa.from('restore_jobs').update({ status: 'completed', progress: 100, log }).eq('id', runningJobId);
    if (completionError) throw new Error('Completion persistence failed');
    return new Response(JSON.stringify({ ok: true, job_id: jobId, inserted: totalInserted, log }), { headers: corsHeaders });
  } catch {
    if (supa && jobId) {
      try { await supa.from('restore_jobs').update({ status: 'failed', inserted_rows: totalInserted, log, error: 'Restore failed; previous writes may have been applied' }).eq('id', jobId); } catch { /* response still reports failure */ }
    }
    return new Response(JSON.stringify({ error: 'Restore failed; no automatic rollback of applied rows', job_id: jobId }), { status: 500, headers: corsHeaders });
  }
});