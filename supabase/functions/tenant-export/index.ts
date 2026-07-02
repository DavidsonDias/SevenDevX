// 📦 Tenant Export v4 — JSON + Markdown + HTML (imprimível em PDF) + arquivos reais de storage (SVG/PNG/imagens).
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

// Buckets por domínio (só baixamos binários dos relevantes ao domínio)
const DOMAIN_BUCKETS: Record<string, string[]> = {
  projects: ['project-images'],
  cms: ['blog-images'],
  branding: ['tech-icons', 'branding-assets', 'logos'],
  crm: ['attachments'],
};
const ALL_BUCKETS = ['blog-images', 'project-images', 'tech-icons', 'attachments', 'branding-assets', 'logos'];

// CRC32
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function buildZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = []; const central: Uint8Array[] = []; let offset = 0;
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

// ─────────── Markdown helpers ───────────
function esc(v: any): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200);
}
function rowsToMd(rows: any[]): string {
  if (!rows?.length) return '_Sem registros._\n';
  const cols = Object.keys(rows[0]).slice(0, 8);
  const head = `| ${cols.join(' | ')} |\n|${cols.map(() => '---').join('|')}|\n`;
  const body = rows.slice(0, 50).map(r => `| ${cols.map(c => esc(r[c])).join(' | ')} |`).join('\n');
  const more = rows.length > 50 ? `\n\n_+ ${rows.length - 50} linhas omitidas — ver JSON completo._` : '';
  return head + body + more + '\n';
}
function domainToMarkdown(domain: string, dump: Record<string, any>): string {
  let md = `# 📦 Backup — ${domain.toUpperCase()}\n\nGerado em ${new Date().toLocaleString('pt-BR')}\n\n`;
  for (const [table, rows] of Object.entries(dump)) {
    md += `## \`${table}\`\n\n`;
    if ((rows as any)?._error) { md += `⚠️ **Erro:** ${(rows as any)._error}\n\n`; continue; }
    md += `**${(rows as any[]).length}** registros\n\n${rowsToMd(rows as any[])}\n`;
  }
  return md;
}
function domainToHtml(domain: string, dump: Record<string, any>): string {
  let body = `<h1>📦 Backup — ${domain.toUpperCase()}</h1><p><em>Gerado em ${new Date().toLocaleString('pt-BR')}</em></p>`;
  for (const [table, rows] of Object.entries(dump)) {
    body += `<h2><code>${table}</code></h2>`;
    if ((rows as any)?._error) { body += `<p style="color:#c00">Erro: ${(rows as any)._error}</p>`; continue; }
    const r = rows as any[];
    body += `<p><strong>${r.length}</strong> registros</p>`;
    if (!r.length) { body += '<p><em>Sem dados</em></p>'; continue; }
    const cols = Object.keys(r[0]).slice(0, 8);
    body += '<table><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    for (const row of r.slice(0, 100)) {
      body += '<tr>' + cols.map(c => `<td>${esc(row[c])}</td>`).join('') + '</tr>';
    }
    body += '</tbody></table>';
  }
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Backup ${domain}</title>
<style>body{font-family:-apple-system,Inter,sans-serif;padding:32px;color:#111;max-width:1100px;margin:auto}
h1{border-bottom:2px solid #000;padding-bottom:8px}h2{margin-top:32px;color:#222;font-size:16px}
table{width:100%;border-collapse:collapse;font-size:11px;margin:8px 0 24px}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
th{background:#f4f4f4;font-weight:600}code{background:#eee;padding:2px 6px;border-radius:4px}
@media print{body{padding:0}}</style></head><body>${body}
<footer style="margin-top:48px;font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:8px">
SevenOS Backup v4 · Abra este HTML no navegador e use "Imprimir → Salvar como PDF" para exportar.</footer></body></html>`;
}

// ─────────── Storage recursive download ───────────
async function collectBucketFiles(supa: any, bucket: string, prefix = '', out: { name: string; data: Uint8Array }[] = [], depth = 0): Promise<void> {
  if (depth > 4) return;
  const { data: list } = await supa.storage.from(bucket).list(prefix, { limit: 200 });
  if (!list) return;
  for (const item of list) {
    const p = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null || item.metadata === null) {
      // folder
      await collectBucketFiles(supa, bucket, p, out, depth + 1);
    } else {
      try {
        const { data: blob } = await supa.storage.from(bucket).download(p);
        if (blob) {
          const buf = new Uint8Array(await blob.arrayBuffer());
          out.push({ name: `storage/${bucket}/${p}`, data: buf });
        }
      } catch { /* skip */ }
    }
  }
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
    const includeFiles: boolean = body?.include_files !== false; // default true

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
      // 📄 3 formatos por domínio: JSON, Markdown, HTML (imprimível em PDF)
      files.push({ name: `${domain}/data.json`, data: enc.encode(JSON.stringify(domainDump, null, 2)) });
      files.push({ name: `${domain}/report.md`, data: enc.encode(domainToMarkdown(domain, domainDump)) });
      files.push({ name: `${domain}/report.html`, data: enc.encode(domainToHtml(domain, domainDump)) });
    }

    // 🖼️ Arquivos reais dos buckets (SVG, PNG, logos, imagens de projetos, ícones tech, blog)
    if (includeFiles) {
      const bucketsToPull = onlyDomain
        ? (DOMAIN_BUCKETS[onlyDomain] || [])
        : ALL_BUCKETS;
      const storageInv: Record<string, any> = {};
      for (const b of bucketsToPull) {
        const before = files.length;
        try {
          await collectBucketFiles(supa, b, '', files);
          storageInv[b] = { downloaded: files.length - before };
        } catch (e: any) {
          storageInv[b] = { _error: e?.message || 'fail' };
        }
      }
      files.push({ name: 'storage-inventory.json', data: enc.encode(JSON.stringify(storageInv, null, 2)) });
      summary['storage'] = {
        tables: Object.fromEntries(Object.entries(storageInv).map(([k, v]: any) => [k, v.downloaded ?? 0])),
        total: Object.values(storageInv).reduce((s: number, v: any) => s + (v.downloaded ?? 0), 0),
      };
    }

    const manifest = {
      exported_at: new Date().toISOString(), by: user.email, version: 4,
      domains: Object.keys(domainsToRun), summary,
      formats: ['json', 'markdown', 'html'], includes_binaries: includeFiles,
    };
    files.push({ name: 'manifest.json', data: enc.encode(JSON.stringify(manifest, null, 2)) });
    files.push({
      name: 'README.md',
      data: enc.encode(`# 📦 SevenOS Backup v4

**Exportado:** ${manifest.exported_at}
**Por:** ${user.email}
**Domínios:** ${Object.keys(domainsToRun).join(', ')}

## Estrutura

Cada domínio tem sua pasta com **3 formatos**:

- \`<dominio>/data.json\` → dados brutos completos (reimportáveis).
- \`<dominio>/report.md\` → relatório legível (GitHub/Obsidian/VS Code).
- \`<dominio>/report.html\` → relatório imprimível (abra → **Imprimir → Salvar como PDF**).

## Arquivos binários

Pasta \`storage/\` contém os arquivos reais dos buckets:
- \`storage/tech-icons/\` — ícones SVG das tecnologias
- \`storage/project-images/\` — imagens dos projetos
- \`storage/blog-images/\` — imagens do blog
- \`storage/branding-assets/\` / \`storage/logos/\` — logos
- \`storage/attachments/\` — anexos de contratos e CRM

## Restaurar

Suba o ZIP em **/admin/restore** e selecione quais tabelas restaurar.
`),
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
      metadata: { checksum_sha256: checksum, version: 4, domains: Object.keys(domainsToRun), files: files.length, includes_binaries: includeFiles },
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

    return new Response(JSON.stringify({ ok: true, path, size: zip.byteLength, checksum, url: signed?.signedUrl, file_count: files.length, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
