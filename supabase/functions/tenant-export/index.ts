// 📦 Tenant Export v3 — backup completo/domínio + SHA-256 + inventário de storage + catchall + retenção.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const DOMAINS: Record<string, string[]> = {
  projects: ['projects', 'project_budgets', 'project_stages', 'stage_checklist_items', 'stage_documents', 'pipeline_stage_log', 'tech_registry', 'tag_registry', 'team_members'],
  crm: ['clients', 'contacts', 'contact_messages', 'client_interactions', 'chat_conversations', 'chat_messages', 'whatsapp_threads', 'whatsapp_messages'],
  finance: ['transactions', 'time_entries', 'bank_import_batches', 'fx_rates'],
  cms: ['services_cms', 'faq_items', 'faq_categories', 'blog_posts', 'blog_categories'],
  ops: ['events', 'notifications', 'notification_preferences', 'audit_log', 'incidents', 'incident_timeline', 'service_health_snapshots', 'analytics_events', 'page_views', 'ai_referrals', 'ai_citations', 'ai_usage', 'ai_ops_actions'],
  branding: ['logo_variations', 'branding_assets'],
  integrations: ['integration_providers', 'integration_logs', 'oauth_connections', 'webhooks', 'webhook_deliveries', 'webhook_dlq', 'marketplace_installs', 'user_integration_favorites', 'citation_monitor_settings', 'vercel_deploy_alerts'],
  automations: ['automations', 'automation_runs', 'response_templates', 'process_templates', 'process_template_stages'],
  security: ['system_settings', 'user_mfa', 'tenant_backups', 'restore_jobs', 'admin_sessions', 'push_subscriptions', 'contract_versions', 'attachments'],
};
const ALL_DOMAIN_TABLES = new Set(Object.values(DOMAINS).flat());

// CRC32
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function buildZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const crc = crc32(f.data); const size = f.data.length;
    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true); dv.setUint16(10, 0, true); dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, size, true); dv.setUint32(22, size, true);
    dv.setUint16(26, nameBytes.length, true); dv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    parts.push(local, f.data);
    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true); cv.setUint16(10, 0, true); cv.setUint16(12, 0, true); cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, size, true); cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);
    central.push(cd);
    offset += local.length + f.data.length;
  }
  const cdSize = central.reduce((a, b) => a + b.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
  const total = offset + cdSize + 22;
  const out = new Uint8Array(total);
  let p = 0;
  for (const b of parts) { out.set(b, p); p += b.length; }
  for (const b of central) { out.set(b, p); p += b.length; }
  out.set(eocd, p);
  return out;
}

async function sha256Hex(buf: Uint8Array): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const onlyDomain: string | undefined = body?.domain;

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const enc = new TextEncoder();
    const files: { name: string; data: Uint8Array }[] = [];
    const summary: Record<string, { tables: Record<string, number>; total: number }> = {};
    const allTables: string[] = [];

    const domainsToRun = onlyDomain ? { [onlyDomain]: DOMAINS[onlyDomain] || [] } : DOMAINS;

    for (const [domain, tables] of Object.entries(domainsToRun)) {
      const domainDump: Record<string, any> = {};
      const counts: Record<string, number> = {};
      let totalRows = 0;
      for (const t of tables) {
        try {
          const { data, error } = await supa.from(t).select('*').limit(50000);
          if (error) { domainDump[t] = { _error: error.message }; counts[t] = 0; continue; }
          domainDump[t] = data ?? [];
          counts[t] = (data ?? []).length;
          totalRows += counts[t];
          allTables.push(t);
        } catch (e: any) { domainDump[t] = { _error: e?.message || 'fail' }; counts[t] = 0; }
      }
      summary[domain] = { tables: counts, total: totalRows };
      files.push({ name: `${domain}.json`, data: enc.encode(JSON.stringify(domainDump, null, 2)) });
    }

    // 📦 Storage buckets inventory (metadata + counts) — só em backup completo
    if (!onlyDomain) {
      const storageInv: Record<string, any> = {};
      const buckets = ['blog-images', 'project-images', 'tech-icons', 'attachments', 'backups'];
      for (const b of buckets) {
        try {
          const { data } = await supa.storage.from(b).list('', { limit: 1000 });
          storageInv[b] = {
            file_count: data?.length ?? 0,
            files: (data ?? []).slice(0, 500).map((f: any) => ({
              name: f.name, size: f.metadata?.size ?? null, mime: f.metadata?.mimetype ?? null, updated: f.updated_at,
            })),
          };
        } catch { storageInv[b] = { _error: 'list_failed' }; }
      }
      files.push({ name: 'storage-inventory.json', data: enc.encode(JSON.stringify(storageInv, null, 2)) });
      summary['storage'] = {
        tables: Object.fromEntries(Object.entries(storageInv).map(([k, v]: any) => [k, v.file_count ?? 0])),
        total: Object.values(storageInv).reduce((s: number, v: any) => s + (v.file_count ?? 0), 0),
      };
    }

    // Manifest + README
    const manifest = {
      exported_at: new Date().toISOString(), by: user.email, version: 3,
      domains: Object.keys(domainsToRun), summary,
    };
    files.push({ name: 'manifest.json', data: enc.encode(JSON.stringify(manifest, null, 2)) });
    files.push({
      name: 'README.txt',
      data: enc.encode(`SevenOS Backup v3
Exportado em: ${manifest.exported_at}
Por: ${user.email}

Cada arquivo .json contém um domínio completo do sistema.
storage-inventory.json lista metadados de todos os buckets.
Restaure via /admin/restore selecionando o ZIP.\n`),
    });

    const zip = buildZip(files);
    const checksum = await sha256Hex(zip);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const path = `${user.id}/${stamp}${onlyDomain ? `-${onlyDomain}` : '-full'}.zip`;

    const { error: upErr } = await supa.storage.from('backups').upload(path, zip, {
      contentType: 'application/zip', upsert: false,
    });
    if (upErr) throw upErr;

    const { data: signed } = await supa.storage.from('backups').createSignedUrl(path, 3600);

    await supa.from('tenant_backups').insert({
      storage_path: path, size_bytes: zip.byteLength,
      tables_included: allTables, triggered_by: user.id,
      triggered_kind: onlyDomain ? `manual:${onlyDomain}` : 'manual:full',
      status: 'completed',
      metadata: { checksum_sha256: checksum, version: 3, domains: Object.keys(domainsToRun) },
    } as any);

    // 🧹 Retenção automática
    try {
      const { data: retSetting } = await supa.from('system_settings').select('value').eq('key', 'backup_retention_days').maybeSingle();
      const days = Number((retSetting?.value as any)) || 0;
      if (days > 0) {
        const cutoff = new Date(Date.now() - days * 86400_000).toISOString();
        const { data: old } = await supa.from('tenant_backups').select('id, storage_path').lt('created_at', cutoff);
        if (old && old.length) {
          await supa.storage.from('backups').remove(old.map((o: any) => o.storage_path));
          await supa.from('tenant_backups').delete().in('id', old.map((o: any) => o.id));
        }
      }
    } catch { /* ignore */ }

    return new Response(JSON.stringify({ ok: true, path, size: zip.byteLength, checksum, url: signed?.signedUrl, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
