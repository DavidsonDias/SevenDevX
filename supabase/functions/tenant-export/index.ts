// 📦 Tenant Export v2 — backup completo, ZIP por domínio + manifest.
// Para cada domínio (projects/crm/finance/cms/ops/branding/integrations/automations)
// gera um arquivo JSON. Empacota tudo em ZIP (stored, sem compressão pesada) e upa no bucket "backups".
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// 🗂️ Domínios → tabelas. Cada domínio vira um JSON dentro do ZIP.
const DOMAINS: Record<string, string[]> = {
  projects: ['projects', 'project_budgets', 'project_milestones', 'tech_registry', 'tag_registry'],
  crm: ['clients', 'contacts', 'pipelines', 'pipeline_stages', 'pipeline_cards', 'leads', 'lead_scores'],
  finance: ['transactions', 'invoices', 'invoice_items', 'time_entries', 'bank_import_batches', 'forecasts'],
  cms: ['services_cms', 'faq_items', 'blog_posts', 'testimonials', 'case_studies'],
  ops: ['events', 'notifications', 'audit_logs', 'incidents', 'health_checks', 'cron_jobs'],
  branding: ['logo_variations', 'brand_kits'],
  integrations: ['integration_providers', 'oauth_connections', 'webhooks', 'webhook_deliveries', 'webhook_dlq', 'marketplace_installs'],
  automations: ['automations', 'automation_runs', 'response_templates'],
  security: ['system_settings', 'user_mfa', 'tenant_backups'],
};

// 🤐 CRC32 + ZIP "stored" (sem deflate) — leve, sem dependências externas.
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
    const crc = crc32(f.data);
    const size = f.data.length;
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
    const onlyDomain: string | undefined = body?.domain; // opcional: backup só de 1 domínio

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const enc = new TextEncoder();
    const files: { name: string; data: Uint8Array }[] = [];
    const summary: Record<string, { tables: Record<string, number>; total: number }> = {};
    let allTables: string[] = [];

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
        } catch (e: any) {
          domainDump[t] = { _error: e?.message || 'fail' };
          counts[t] = 0;
        }
      }
      summary[domain] = { tables: counts, total: totalRows };
      files.push({ name: `${domain}.json`, data: enc.encode(JSON.stringify(domainDump, null, 2)) });
    }

    // 🗺️ Manifest
    const manifest = {
      exported_at: new Date().toISOString(),
      by: user.email,
      version: 2,
      domains: Object.keys(domainsToRun),
      summary,
    };
    files.push({ name: 'manifest.json', data: enc.encode(JSON.stringify(manifest, null, 2)) });
    files.push({
      name: 'README.txt',
      data: enc.encode(
`SevenOS Backup v2
Exportado em: ${manifest.exported_at}
Por: ${user.email}

Cada arquivo .json contém um domínio completo do sistema.
Restaure via /admin/restore selecionando o ZIP.\n`),
    });

    const zip = buildZip(files);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const path = `${user.id}/${stamp}${onlyDomain ? `-${onlyDomain}` : '-full'}.zip`;

    const { error: upErr } = await supa.storage.from('backups').upload(path, zip, {
      contentType: 'application/zip', upsert: false,
    });
    if (upErr) throw upErr;

    const { data: signed } = await supa.storage.from('backups').createSignedUrl(path, 3600);

    await supa.from('tenant_backups').insert({
      storage_path: path,
      size_bytes: zip.byteLength,
      tables_included: allTables,
      triggered_by: user.id,
      triggered_kind: onlyDomain ? `manual:${onlyDomain}` : 'manual:full',
      status: 'completed',
    });

    return new Response(JSON.stringify({ ok: true, path, size: zip.byteLength, url: signed?.signedUrl, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
