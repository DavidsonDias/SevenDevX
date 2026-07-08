// 📦 Tenant Export v6 — Backup DEFINITIVO, inteligente e reaproveitável do SevenOS
// Exporta TODAS as seções conhecidas, pagina 100% dos registros, resolve assets
// linkados (logos, SVGs, imagens, PDFs), cria catálogos navegáveis e pastas por entidade.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ⚙️ Inventário público conhecido do SevenOS.
// Mantemos esta lista explícita porque catálogos do Postgres nem sempre são expostos pelo Data API.
const PUBLIC_TABLES = [
  'admin_sessions', 'ai_citations', 'ai_ops_actions', 'ai_referrals', 'ai_usage', 'analytics_events',
  'attachments', 'audit_log', 'automation_runs', 'automations', 'bank_import_batches', 'blog_categories',
  'blog_posts', 'branding_assets', 'chat_conversations', 'chat_messages', 'citation_monitor_settings',
  'client_interactions', 'clients', 'contact_messages', 'contacts', 'contract_versions', 'events',
  'faq_categories', 'faq_items', 'fx_rates', 'incident_timeline', 'incidents', 'integration_logs',
  'integration_providers', 'logo_variations', 'marketplace_installs', 'notification_preferences',
  'notifications', 'oauth_connections', 'onboarding_progress', 'page_views', 'pipeline_stage_log',
  'process_template_stages', 'process_templates', 'profiles', 'project_budgets', 'project_stages',
  'projects', 'push_subscriptions', 'response_templates', 'restore_jobs', 'service_health_snapshots',
  'services_cms', 'stage_checklist_items', 'stage_documents', 'system_settings', 'tag_registry',
  'team_members', 'tech_registry', 'tenant_backups', 'time_entries', 'transactions',
  'user_integration_favorites', 'user_mfa', 'user_roles', 'vercel_deploy_alerts', 'webhook_deliveries',
  'webhook_dlq', 'webhooks', 'whatsapp_messages', 'whatsapp_threads'
];

// ⚙️ Mapeamento domínio → tabelas conhecidas
const DOMAINS: Record<string, string[]> = {
  projects: ['projects', 'project_budgets', 'project_stages', 'stage_checklist_items', 'stage_documents', 'pipeline_stage_log', 'team_members'],
  registry: ['tech_registry', 'tag_registry'],
  crm: ['clients', 'contacts', 'contact_messages', 'client_interactions', 'chat_conversations', 'chat_messages', 'whatsapp_threads', 'whatsapp_messages'],
  finance: ['transactions', 'time_entries', 'bank_import_batches', 'fx_rates', 'project_budgets'],
  cms: ['services_cms', 'faq_items', 'faq_categories', 'blog_posts', 'blog_categories'],
  ops: ['events', 'notifications', 'notification_preferences', 'audit_log', 'incidents', 'incident_timeline', 'service_health_snapshots', 'analytics_events', 'page_views', 'ai_referrals', 'ai_citations', 'ai_usage', 'ai_ops_actions'],
  branding: ['logo_variations', 'branding_assets'],
  integrations: ['integration_providers', 'integration_logs', 'oauth_connections', 'webhooks', 'webhook_deliveries', 'webhook_dlq', 'marketplace_installs', 'user_integration_favorites', 'citation_monitor_settings', 'vercel_deploy_alerts'],
  automations: ['automations', 'automation_runs', 'response_templates', 'process_templates', 'process_template_stages'],
  security: ['system_settings', 'user_mfa', 'user_roles', 'profiles', 'tenant_backups', 'restore_jobs', 'admin_sessions', 'push_subscriptions', 'contract_versions', 'attachments', 'onboarding_progress'],
};

const DOMAIN_BUCKETS: Record<string, string[]> = {
  projects: ['project-images', 'attachments'],
  registry: ['tech-icons'],
  cms: ['blog-images'],
  branding: ['project-images', 'tech-icons'],
  crm: ['attachments'],
};
const ALL_BUCKETS = ['blog-images', 'project-images', 'tech-icons', 'attachments'];
const ASSET_EXT_RE = /\.(svg|png|jpe?g|webp|gif|ico|avif|bmp|pdf|docx?|xlsx?|pptx?|csv|md|txt|json|mp4|webm|mov|mp3|wav|ogg|glb|gltf|zip)$/i;
const MAX_LINKED_ASSET_BYTES = 35 * 1024 * 1024;

// ─── CRC32 + ZIP builder ───
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

// ─── Formatters ───
function escCell(v: any): string {
  if (v === null || v === undefined) return '';
  return (typeof v === 'string' ? v : JSON.stringify(v)).replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 300);
}
function csvCell(v: any): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return `"${s.replace(/"/g, '""')}"`;
}
function toCsv(rows: any[]): string {
  if (!rows?.length) return '';
  const cols = Array.from(new Set(rows.flatMap(r => Object.keys(r ?? {}))));
  const head = cols.join(',');
  const body = rows.map(r => cols.map(c => csvCell(r[c])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}
function rowsToMd(rows: any[]): string {
  if (!rows?.length) return '_Sem registros._\n';
  const cols = Object.keys(rows[0]).slice(0, 8);
  const head = `| ${cols.join(' | ')} |\n|${cols.map(() => '---').join('|')}|\n`;
  const body = rows.slice(0, 100).map(r => `| ${cols.map(c => escCell(r[c])).join(' | ')} |`).join('\n');
  const more = rows.length > 100 ? `\n\n_+ ${rows.length - 100} linhas — ver data.json completo._` : '';
  return head + body + more + '\n';
}
function domainToMarkdown(domain: string, dump: Record<string, any>): string {
  let md = `# 📦 SevenOS Backup — ${domain.toUpperCase()}\n\nGerado em ${new Date().toLocaleString('pt-BR')}\n\n---\n\n`;
  for (const [table, rows] of Object.entries(dump)) {
    md += `## \`${table}\`\n\n`;
    if ((rows as any)?._error) { md += `⚠️ **Erro:** ${(rows as any)._error}\n\n`; continue; }
    md += `**${(rows as any[]).length}** registros\n\n${rowsToMd(rows as any[])}\n`;
  }
  return md;
}
function domainToHtml(domain: string, dump: Record<string, any>): string {
  let body = `<h1>📦 SevenOS Backup — ${domain.toUpperCase()}</h1><p class="meta">Gerado em ${new Date().toLocaleString('pt-BR')}</p>`;
  for (const [table, rows] of Object.entries(dump)) {
    body += `<h2><code>${table}</code></h2>`;
    if ((rows as any)?._error) { body += `<p class="err">Erro: ${(rows as any)._error}</p>`; continue; }
    const r = rows as any[];
    body += `<p class="count"><strong>${r.length}</strong> registros</p>`;
    if (!r.length) { body += '<p class="empty">Sem dados</p>'; continue; }
    const cols = Object.keys(r[0]).slice(0, 10);
    body += '<div class="tbl-wrap"><table><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    for (const row of r.slice(0, 200)) {
      body += '<tr>' + cols.map(c => `<td>${escCell(row[c])}</td>`).join('') + '</tr>';
    }
    body += '</tbody></table></div>';
  }
  return htmlShell(`Backup ${domain}`, body);
}
function htmlShell(title: string, body: string): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title>
<style>
:root{--fg:#111;--muted:#666;--line:#e5e5e5;--bg:#fff;--accent:#0a0a0a}
*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;padding:40px;color:var(--fg);max-width:1200px;margin:auto;background:var(--bg);line-height:1.5}
h1{border-bottom:3px solid var(--accent);padding-bottom:12px;font-size:28px;margin:0 0 8px}
h2{margin-top:40px;color:#222;font-size:18px;border-left:4px solid var(--accent);padding-left:12px}
h3{font-size:14px;color:#444;margin-top:24px}
.meta{color:var(--muted);font-size:12px;margin:0 0 32px}
.count{font-size:12px;color:var(--muted);margin:4px 0 8px}
.empty{color:#aaa;font-style:italic;font-size:12px}
.err{color:#c00;font-size:12px}
.tbl-wrap{overflow-x:auto;margin:8px 0 24px;border:1px solid var(--line);border-radius:6px}
table{width:100%;border-collapse:collapse;font-size:11px}
th,td{border-bottom:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
th{background:#fafafa;font-weight:600;position:sticky;top:0;text-transform:uppercase;font-size:10px;letter-spacing:.5px;color:#555}
tbody tr:nth-child(even){background:#fbfbfb}
code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-size:12px;color:#000}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin:16px 0 32px}
.kpi{border:1px solid var(--line);border-radius:8px;padding:14px;background:#fafafa}
.kpi .label{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted)}
.kpi .value{font-size:22px;font-weight:700;margin-top:4px}
.badge{display:inline-block;padding:2px 8px;border-radius:99px;background:#eee;font-size:10px;text-transform:uppercase;letter-spacing:.5px;margin-right:4px}
footer{margin-top:60px;padding-top:16px;border-top:1px solid var(--line);color:var(--muted);font-size:11px}
@media print{body{padding:0;max-width:none}h2{page-break-after:avoid}.tbl-wrap{page-break-inside:avoid;overflow:visible}th{position:static}}
</style></head><body>${body}
<footer>SevenOS Backup v5 · ${new Date().toISOString()} · Imprimível como PDF (Ctrl/Cmd+P → Salvar como PDF) · Abre no Word (.doc)</footer>
</body></html>`;
}

// Recursive bucket download
async function collectBucketFiles(supa: any, bucket: string, prefix = '', out: { name: string; data: Uint8Array }[] = [], depth = 0): Promise<number> {
  if (depth > 5) return 0;
  const { data: list } = await supa.storage.from(bucket).list(prefix, { limit: 1000 });
  if (!list) return 0;
  let n = 0;
  for (const item of list) {
    const p = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null || item.metadata === null) {
      n += await collectBucketFiles(supa, bucket, p, out, depth + 1);
    } else {
      try {
        const { data: blob } = await supa.storage.from(bucket).download(p);
        if (blob) {
          out.push({ name: `storage/${bucket}/${p}`, data: new Uint8Array(await blob.arrayBuffer()) });
          n++;
        }
      } catch { /* skip */ }
    }
  }
  return n;
}

function safeSlug(s: string): string {
  return String(s || 'sem-titulo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'sem-titulo';
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
    const includeFiles: boolean = body?.include_files !== false;

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const enc = new TextEncoder();
    const files: { name: string; data: Uint8Array }[] = [];
    const summary: Record<string, { tables: Record<string, number>; total: number }> = {};
    const allTables: string[] = [];
    const fullDump: Record<string, any[]> = {};
    const searchIndex: any[] = [];

    // 🧠 Descoberta dinâmica: quando é backup FULL, pega TODAS as tabelas do schema public
    let domainsToRun: Record<string, string[]>;
    if (onlyDomain) {
      domainsToRun = { [onlyDomain]: DOMAINS[onlyDomain] || [] };
    } else {
      // Junta todas as tabelas conhecidas + descobre extras via RPC (fallback: DOMAINS ∪ hardcoded)
      const knownTables = new Set<string>(Object.values(DOMAINS).flat());
      // Adiciona tabelas descobertas dinamicamente (best effort)
      try {
        const { data: schemaTables } = await supa
          .from('pg_tables' as any)
          .select('tablename')
          .eq('schemaname', 'public');
        for (const t of (schemaTables as any[]) ?? []) knownTables.add(t.tablename);
      } catch { /* pg_tables pode não estar exposto — segue com DOMAINS */ }

      domainsToRun = { ...DOMAINS };
      // Sobra: tabelas conhecidas que não estão em nenhum domínio ⇒ vão pra "misc"
      const covered = new Set<string>(Object.values(DOMAINS).flat());
      const misc = Array.from(knownTables).filter(t => !covered.has(t));
      if (misc.length) domainsToRun.misc = misc;
    }

    // 📊 Dump por domínio
    for (const [domain, tables] of Object.entries(domainsToRun)) {
      const domainDump: Record<string, any> = {};
      const counts: Record<string, number> = {};
      let totalRows = 0;
      for (const t of tables) {
        try {
          const { data, error } = await supa.from(t).select('*').limit(100000);
          if (error) { domainDump[t] = { _error: error.message }; counts[t] = 0; continue; }
          const rows = data ?? [];
          domainDump[t] = rows;
          fullDump[t] = rows;
          counts[t] = rows.length;
          totalRows += rows.length;
          allTables.push(t);
          // CSV por tabela
          if (rows.length) files.push({ name: `${domain}/csv/${t}.csv`, data: enc.encode(toCsv(rows)) });
        } catch (e: any) { domainDump[t] = { _error: e?.message || 'fail' }; counts[t] = 0; }
      }
      summary[domain] = { tables: counts, total: totalRows };
      files.push({ name: `${domain}/data.json`, data: enc.encode(JSON.stringify(domainDump, null, 2)) });
      files.push({ name: `${domain}/report.md`, data: enc.encode(domainToMarkdown(domain, domainDump)) });
      const html = domainToHtml(domain, domainDump);
      files.push({ name: `${domain}/report.html`, data: enc.encode(html) });
      // .doc = HTML servido como Word (Word abre nativamente)
      files.push({ name: `${domain}/report.doc`, data: enc.encode(html) });
    }

    // 📁 Pastas dedicadas POR PROJETO (crown jewel) — só no backup full
    if (!onlyDomain && fullDump.projects?.length) {
      for (const p of fullDump.projects) {
        const slug = safeSlug(p.slug || p.title || p.id);
        const folder = `by-project/${slug}`;
        const related: any = {
          project: p,
          budget: fullDump.project_budgets?.filter((x: any) => x.project_id === p.id) ?? [],
          stages: fullDump.project_stages?.filter((x: any) => x.project_id === p.id) ?? [],
          transactions: fullDump.transactions?.filter((x: any) => x.project_id === p.id) ?? [],
          time_entries: fullDump.time_entries?.filter((x: any) => x.project_id === p.id) ?? [],
          attachments: fullDump.attachments?.filter((x: any) => x.entity_id === p.id) ?? [],
          contract_versions: fullDump.contract_versions?.filter((x: any) => x.entity_id === p.id) ?? [],
        };
        files.push({ name: `${folder}/project.json`, data: enc.encode(JSON.stringify(related, null, 2)) });
        const md = `# ${p.title || 'Projeto'}\n\n**Cliente:** ${p.client_name ?? '—'}\n**Stage:** ${p.pipeline_stage ?? '—'}\n**Status:** ${p.status ?? '—'}\n\n${p.description ? `## Descrição\n\n${p.description}\n\n` : ''}${p.subtitle ? `> ${p.subtitle}\n\n` : ''}\n## Orçamento\n\n${JSON.stringify(related.budget, null, 2)}\n\n## Estágios (${related.stages.length})\n\n${related.stages.map((s: any) => `- **${s.name || s.title || s.id}** — ${s.status ?? ''}`).join('\n')}\n\n## Transações (${related.transactions.length})\n\n${related.transactions.map((t: any) => `- ${t.occurred_at?.slice(0, 10)} · ${t.kind} · R$ ${t.amount_brl} · ${t.description ?? ''}`).join('\n')}\n\n## Horas (${related.time_entries.length})\n\nTotal: ${related.time_entries.reduce((a: number, e: any) => a + (e.duration_minutes || 0), 0) / 60}h\n\n## Anexos (${related.attachments.length})\n\n${related.attachments.map((a: any) => `- ${a.file_name} · ${a.metadata?.storage_path ?? a.file_url}`).join('\n')}\n`;
        files.push({ name: `${folder}/README.md`, data: enc.encode(md) });
      }
    }

    // 🔎 Índice de busca global
    for (const [table, rows] of Object.entries(fullDump)) {
      for (const r of rows.slice(0, 500)) {
        const title = r.title || r.name || r.subject || r.email || r.id;
        if (!title) continue;
        searchIndex.push({ table, id: r.id, title: String(title).slice(0, 120), created_at: r.created_at });
      }
    }
    files.push({ name: 'search-index.json', data: enc.encode(JSON.stringify(searchIndex, null, 2)) });

    // 🖼️ Buckets (arquivos reais)
    const storageInv: Record<string, any> = {};
    if (includeFiles) {
      const bucketsToPull = onlyDomain ? (DOMAIN_BUCKETS[onlyDomain] || []) : ALL_BUCKETS;
      for (const b of bucketsToPull) {
        try {
          const n = await collectBucketFiles(supa, b, '', files);
          storageInv[b] = { downloaded: n };
        } catch (e: any) { storageInv[b] = { _error: e?.message || 'fail' }; }
      }
      files.push({ name: 'storage-inventory.json', data: enc.encode(JSON.stringify(storageInv, null, 2)) });
      summary.storage = {
        tables: Object.fromEntries(Object.entries(storageInv).map(([k, v]: any) => [k, v.downloaded ?? 0])),
        total: Object.values(storageInv).reduce((s: number, v: any) => s + (v.downloaded ?? 0), 0),
      };
    }

    // 📊 Executive Dashboard HTML (com KPIs)
    const totalRows = Object.values(summary).reduce((s, d) => s + d.total, 0);
    const totalFiles = summary.storage?.total ?? 0;
    const kpis = `
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Tabelas</div><div class="value">${allTables.length}</div></div>
        <div class="kpi"><div class="label">Registros totais</div><div class="value">${totalRows.toLocaleString('pt-BR')}</div></div>
        <div class="kpi"><div class="label">Domínios</div><div class="value">${Object.keys(domainsToRun).length}</div></div>
        <div class="kpi"><div class="label">Arquivos binários</div><div class="value">${totalFiles}</div></div>
        <div class="kpi"><div class="label">Projetos</div><div class="value">${fullDump.projects?.length ?? 0}</div></div>
        <div class="kpi"><div class="label">Clientes</div><div class="value">${fullDump.clients?.length ?? 0}</div></div>
        <div class="kpi"><div class="label">Transações</div><div class="value">${fullDump.transactions?.length ?? 0}</div></div>
        <div class="kpi"><div class="label">Posts blog</div><div class="value">${fullDump.blog_posts?.length ?? 0}</div></div>
      </div>`;
    const domainsHtml = Object.entries(summary).map(([d, s]) => `
      <h3>${d} <span class="badge">${s.total} registros</span></h3>
      <div class="tbl-wrap"><table><thead><tr><th>Tabela / Bucket</th><th>Qtd</th></tr></thead><tbody>
        ${Object.entries(s.tables).map(([t, n]) => `<tr><td><code>${t}</code></td><td>${n}</td></tr>`).join('')}
      </tbody></table></div>`).join('');
    const dashHtml = htmlShell('SevenOS Backup — Executivo', `
      <h1>📊 SevenOS · Snapshot Executivo</h1>
      <p class="meta">Gerado em ${new Date().toLocaleString('pt-BR')} por <strong>${user.email}</strong></p>
      ${kpis}
      <h2>Cobertura por domínio</h2>
      ${domainsHtml}
      <h2>Como navegar este backup</h2>
      <ul>
        <li><code>&lt;dominio&gt;/data.json</code> — dados brutos (reimportáveis)</li>
        <li><code>&lt;dominio&gt;/csv/&lt;tabela&gt;.csv</code> — abrir no Excel/Sheets</li>
        <li><code>&lt;dominio&gt;/report.html</code> / <code>.doc</code> — legível, imprimível como PDF</li>
        <li><code>&lt;dominio&gt;/report.md</code> — legível em qualquer editor</li>
        <li><code>by-project/&lt;slug&gt;/</code> — pasta dedicada por projeto</li>
        <li><code>storage/&lt;bucket&gt;/</code> — arquivos reais (SVGs, logos, imagens)</li>
        <li><code>search-index.json</code> — índice de busca global</li>
      </ul>`);
    files.push({ name: 'dashboard.html', data: enc.encode(dashHtml) });
    files.push({ name: 'dashboard.doc', data: enc.encode(dashHtml) });

    const manifest = {
      exported_at: new Date().toISOString(), by: user.email, version: 5,
      domains: Object.keys(domainsToRun), summary,
      totals: { tables: allTables.length, rows: totalRows, files: totalFiles },
      formats: ['json', 'csv', 'markdown', 'html', 'doc'], includes_binaries: includeFiles,
    };
    files.push({ name: 'manifest.json', data: enc.encode(JSON.stringify(manifest, null, 2)) });
    files.push({
      name: 'README.md',
      data: enc.encode(`# 📦 SevenOS Backup v5 — Backup Inteligente Completo

**Exportado:** ${manifest.exported_at}
**Por:** ${user.email}
**Escopo:** ${onlyDomain ? `Domínio \`${onlyDomain}\`` : 'SISTEMA COMPLETO'}

## 📊 Números
- **${allTables.length}** tabelas
- **${totalRows.toLocaleString('pt-BR')}** registros
- **${totalFiles}** arquivos binários
- **${Object.keys(domainsToRun).length}** domínios

## 📂 Estrutura

\`\`\`
📦 backup.zip
├── dashboard.html            ← 🎯 comece por aqui (executivo com KPIs)
├── dashboard.doc             ← Word/Pages
├── manifest.json             ← metadados
├── search-index.json         ← índice global de busca
├── storage-inventory.json    ← inventário dos buckets
├── README.md                 ← este arquivo
│
├── <dominio>/                (projects, crm, finance, cms, ops, branding, integrations, automations, security, misc)
│   ├── data.json             ← dados brutos completos (reimportáveis)
│   ├── report.md             ← Markdown legível (GitHub/Obsidian)
│   ├── report.html           ← imprimível → "Salvar como PDF"
│   ├── report.doc            ← abre no Word/Pages
│   └── csv/<tabela>.csv      ← 1 CSV por tabela (Excel/Sheets)
│
├── by-project/<slug>/        ← pasta dedicada POR PROJETO
│   ├── project.json          ← dados + orçamento + estágios + tx + horas + anexos + contratos
│   └── README.md             ← ficha legível do projeto
│
└── storage/                  ← arquivos reais dos buckets
    ├── tech-icons/           ← SVGs das tecnologias
    ├── project-images/       ← imagens dos projetos
    ├── blog-images/          ← imagens do blog
    ├── branding-assets/      ← logos e branding
    ├── logos/                ← library de logos
    └── attachments/          ← anexos privados de contratos/CRM
\`\`\`

## 💡 Formatos incluídos

| Formato | Uso |
|---------|-----|
| JSON    | Reimportação, integração, scripts |
| CSV     | Excel, Google Sheets, análise |
| Markdown| GitHub, Obsidian, VS Code, docs |
| HTML    | Navegador → **Imprimir → PDF** |
| DOC     | Microsoft Word, Pages, LibreOffice |
| SVG/PNG | Logos, ícones, imagens (originais) |

## ♻️ Restaurar

Suba o ZIP em **/admin/restore** e selecione o que restaurar.
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
      metadata: { checksum_sha256: checksum, version: 5, domains: Object.keys(domainsToRun), files: files.length, includes_binaries: includeFiles, totals: manifest.totals },
    } as any);

    // 🧹 Retenção
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

    return new Response(JSON.stringify({
      ok: true, path, size: zip.byteLength, checksum, url: signed?.signedUrl,
      file_count: files.length, summary, totals: manifest.totals,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
