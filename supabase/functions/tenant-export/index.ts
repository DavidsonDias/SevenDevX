// 📦 Tenant Export — admin-only. Exporta tabelas-chave em JSON dentro de um arquivo único e upa no bucket "backups".
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const TABLES = [
  'projects','clients','contacts','transactions','time_entries','project_budgets',
  'automations','automation_runs','webhooks','webhook_deliveries',
  'response_templates','system_settings','tag_registry','tech_registry',
  'services_cms','faq_items','blog_posts','events','notifications',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const dump: Record<string, any> = { _meta: { exported_at: new Date().toISOString(), by: user.email } };
    for (const t of TABLES) {
      try {
        const { data } = await supa.from(t).select('*').limit(10000);
        dump[t] = data ?? [];
      } catch { dump[t] = []; }
    }

    const json = JSON.stringify(dump, null, 2);
    const bytes = new TextEncoder().encode(json);
    const path = `${user.id}/${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;

    const { error: upErr } = await supa.storage.from('backups').upload(path, bytes, {
      contentType: 'application/json', upsert: false,
    });
    if (upErr) throw upErr;

    const { data: signed } = await supa.storage.from('backups').createSignedUrl(path, 3600);

    await supa.from('tenant_backups').insert({
      storage_path: path, size_bytes: bytes.byteLength,
      tables_included: TABLES, triggered_by: user.id, triggered_kind: 'manual', status: 'completed',
    });

    return new Response(JSON.stringify({ ok: true, path, size: bytes.byteLength, url: signed?.signedUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
