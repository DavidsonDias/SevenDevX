// Selective tenant restore. Admin only. Reads JSON snapshot, upserts selected tables.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin } = await uc.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { backup_id, source_url, selected_tables, mode } = await req.json();
    if (!backup_id && !source_url) return new Response(JSON.stringify({ error: 'missing_source' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const tables = (selected_tables || []).filter((t: string) => RESTORABLE.has(t));
    if (!tables.length) return new Response(JSON.stringify({ error: 'no_valid_tables' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: job } = await supa.from('restore_jobs').insert({
      backup_id, source_url, selected_tables: tables, mode: mode || 'merge',
      status: 'running', executed_by: u.user.id,
    }).select().single();

    // Download snapshot
    let snapshot: any = {};
    try {
      let url = source_url;
      if (!url && backup_id) {
        const { data: b } = await supa.from('tenant_backups').select('storage_path').eq('id', backup_id).single();
        if (b?.storage_path) {
          const { data: signed } = await supa.storage.from('backups').createSignedUrl(b.storage_path, 600);
          url = signed?.signedUrl;
        }
      }
      const r = await fetch(url!);
      snapshot = await r.json();
    } catch (e: any) {
      await supa.from('restore_jobs').update({ status: 'failed', error: 'download: ' + e.message }).eq('id', job!.id);
      return new Response(JSON.stringify({ error: 'download_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const log: any[] = [];
    let totalInserted = 0;
    for (const t of tables) {
      const rows = Array.isArray(snapshot[t]) ? snapshot[t] : [];
      if (!rows.length) { log.push({ table: t, inserted: 0, skipped: true }); continue; }
      // upsert in chunks of 100
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error, count } = await supa.from(t).upsert(chunk, { onConflict: 'id', count: 'exact' });
        if (error) { log.push({ table: t, error: error.message }); break; }
        inserted += (count || chunk.length);
      }
      totalInserted += inserted;
      log.push({ table: t, inserted });
      await supa.from('restore_jobs').update({ inserted_rows: totalInserted, log }).eq('id', job!.id);
    }

    await supa.from('restore_jobs').update({ status: 'completed', progress: 100, log }).eq('id', job!.id);
    return new Response(JSON.stringify({ ok: true, job_id: job!.id, inserted: totalInserted, log }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
