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

function domainToPdf(domain: string, dump: Record<string, any>): Uint8Array {
  const lines: string[] = [`SevenOS Backup — ${domain.toUpperCase()}`, `Gerado em ${new Date().toLocaleString('pt-BR')}`, ''];
  for (const [table, rows] of Object.entries(dump)) {
    if ((rows as any)?._error) {
      lines.push(`${table}: ERRO — ${(rows as any)._error}`);
      continue;
    }
    const r = rows as any[];
    lines.push(`${table}: ${r.length} registros`);
    for (const row of r.slice(0, 8)) {
      const title = row.title || row.name || row.slug || row.email || row.subject || row.id || '';
      if (title) lines.push(`  • ${String(title).slice(0, 90)}`);
    }
    if (r.length > 8) lines.push(`  … +${r.length - 8} registros no JSON/CSV completo`);
    lines.push('');
  }
  return buildSimplePdf(`SevenOS Backup — ${domain}`, lines);
}

function pdfEscape(s: string): string {
  return String(s ?? '').replace(/[\\()]/g, '\\$&').replace(/[\r\n\t]/g, ' ').slice(0, 130);
}
function wrapPdfLine(s: string, max = 96): string[] {
  const clean = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return [''];
  const out: string[] = [];
  let cur = '';
  for (const word of clean.split(' ')) {
    if ((cur + ' ' + word).trim().length > max) { out.push(cur); cur = word; }
    else cur = (cur + ' ' + word).trim();
  }
  if (cur) out.push(cur);
  return out;
}
function buildSimplePdf(title: string, lines: string[]): Uint8Array {
  const enc = new TextEncoder();
  const bodyLines = lines.flatMap(l => wrapPdfLine(l));
  const pages: string[][] = [];
  for (let i = 0; i < bodyLines.length; i += 42) pages.push(bodyLines.slice(i, i + 42));
  if (!pages.length) pages.push(['Sem conteúdo.']);

  const objs: string[] = [];
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[2] = '';
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  const pageNums: number[] = [];
  pages.forEach((page, idx) => {
    const stream = `BT\n/F1 16 Tf\n40 800 Td\n(${pdfEscape(idx === 0 ? title : `${title} — continuação`)}) Tj\n/F1 10 Tf\n0 -24 Td\n14 TL\n${page.map(l => `(${pdfEscape(l)}) Tj T*`).join('\n')}\nET`;
    const contentNum = objs.length;
    objs[contentNum] = `<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}\nendstream`;
    const pageNum = objs.length;
    objs[pageNum] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentNum} 0 R >>`;
    pageNums.push(pageNum);
  });
  objs[2] = `<< /Type /Pages /Kids [${pageNums.map(n => `${n} 0 R`).join(' ')}] /Count ${pageNums.length} >>`;

  let pdf = '%PDF-1.4\n%SevenOS\n';
  const offsets = [0];
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = enc.encode(pdf).length;
    pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefAt = enc.encode(pdf).length;
  pdf += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objs.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  return enc.encode(pdf);
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
  if (depth > 10) return 0;
  let n = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data: list, error } = await supa.storage.from(bucket).list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error || !list?.length) break;
    for (const item of list) {
      const p = prefix ? `${prefix}/${item.name}` : item.name;
      const isFolder = item.id === null || item.metadata === null || (!ASSET_EXT_RE.test(item.name) && !item.metadata?.size);
      if (isFolder) {
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
    if (list.length < 1000) break;
  }
  return n;
}

function safeSlug(s: string): string {
  return String(s || 'sem-titulo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'sem-titulo';
}

function safeFileName(s: string, fallback = 'arquivo'): string {
  const clean = String(s || fallback).split('?')[0].split('#')[0].split('/').pop() || fallback;
  return clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '').slice(0, 120) || fallback;
}

function escapeHtml(v: any): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function guessExtFromContentType(ct?: string | null): string {
  const t = (ct || '').split(';')[0].trim().toLowerCase();
  const map: Record<string, string> = {
    'image/svg+xml': 'svg', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
    'image/gif': 'gif', 'application/pdf': 'pdf', 'text/markdown': 'md', 'text/plain': 'txt',
    'application/json': 'json', 'text/csv': 'csv', 'application/zip': 'zip',
  };
  return map[t] || 'bin';
}

function extractStorageRef(raw: any): { bucket: string; path: string } | null {
  if (typeof raw !== 'string' || !raw) return null;
  const decoded = decodeURIComponent(raw);
  const m = decoded.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/?#]+)\/([^?#]+)/)
    || decoded.match(/\/object\/(?:public|sign)\/([^/?#]+)\/([^?#]+)/);
  if (!m) return null;
  return { bucket: m[1], path: m[2] };
}

function isDownloadableUrl(v: string): boolean {
  try {
    const u = new URL(v);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h.endsWith('.local')) return false;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(h)) return false;
    return /\/storage\/v1\/object\//.test(u.pathname) || /\/__l5e\/assets-v1\//.test(u.pathname) || ASSET_EXT_RE.test(u.pathname);
  } catch { return false; }
}

function collectUrls(value: any, out: { field: string; url: string }[], field = 'root') {
  if (typeof value === 'string') {
    if (isDownloadableUrl(value)) out.push({ field, url: value });
    return;
  }
  if (Array.isArray(value)) value.forEach((x, i) => collectUrls(x, out, `${field}-${i}`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => collectUrls(v, out, `${field}-${k}`));
}

function colorOrDefault(c: any, fallback = '#22d3ee'): string {
  return typeof c === 'string' && /^#[0-9a-f]{3,8}$/i.test(c) ? c : fallback;
}

function iconBadgeSvg(label: string, color: string, subtitle?: string): string {
  const initials = String(label || '7').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '7';
  const bg = colorOrDefault(color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escapeHtml(label)}">
  <defs><radialGradient id="g" cx="30%" cy="20%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".45" stop-color="${bg}"/><stop offset="1" stop-color="#050505"/></radialGradient></defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <rect x="18" y="18" width="476" height="476" rx="96" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>
  <text x="256" y="285" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="138" font-weight="800" fill="#fff">${escapeHtml(initials)}</text>
  ${subtitle ? `<text x="256" y="366" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="600" fill="#fff" opacity=".78">${escapeHtml(subtitle).slice(0, 28)}</text>` : ''}
</svg>`;
}

async function fetchAllRows(supa: any, table: string): Promise<any[]> {
  const out: any[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supa.from(table).select('*').range(offset, offset + 999);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

async function addStorageAsset(
  supa: any,
  files: { name: string; data: Uint8Array }[],
  bucket: string,
  path: string,
  targetFolder: string,
  seen: Set<string>,
  preferredName?: string,
): Promise<boolean> {
  const key = `storage:${bucket}/${path}`;
  if (!bucket || !path || seen.has(key)) return false;
  seen.add(key);
  try {
    const { data: blob, error } = await supa.storage.from(bucket).download(path);
    if (error || !blob) return false;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const name = safeFileName(preferredName || path, 'asset.bin');
    files.push({ name: `${targetFolder}/${name}`, data: bytes });
    return true;
  } catch { return false; }
}

async function addUrlAsset(
  supa: any,
  files: { name: string; data: Uint8Array }[],
  url: string | null | undefined,
  targetFolder: string,
  seen: Set<string>,
  preferredName?: string,
): Promise<boolean> {
  if (!url || typeof url !== 'string' || seen.has(url)) return false;
  const ref = extractStorageRef(url);
  if (ref) return addStorageAsset(supa, files, ref.bucket, ref.path, targetFolder, seen, preferredName || ref.path);
  if (!isDownloadableUrl(url)) return false;
  seen.add(url);
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const len = Number(res.headers.get('content-length') || 0);
    if (len > MAX_LINKED_ASSET_BYTES) return false;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > MAX_LINKED_ASSET_BYTES) return false;
    let name = safeFileName(preferredName || url, 'asset');
    if (!ASSET_EXT_RE.test(name)) name += `.${guessExtFromContentType(res.headers.get('content-type'))}`;
    files.push({ name: `${targetFolder}/${name}`, data: bytes });
    return true;
  } catch { return false; }
}

function techToMarkdown(t: any): string {
  return `# ${t.name || t.slug || 'Tecnologia'}\n\n- **Slug:** ${t.slug ?? '—'}\n- **Categoria:** ${t.category ?? '—'}\n- **Cor:** ${t.color ?? '—'}\n- **Ativa:** ${t.is_active ? 'sim' : 'não'}\n- **Uso:** ${t.usage_count ?? 0}\n\n${t.description ?? ''}\n`;
}

function tagToMarkdown(t: any): string {
  return `# ${t.name || t.slug || 'Tag'}\n\n- **Slug:** ${t.slug ?? '—'}\n- **Cor:** ${t.color ?? '—'}\n- **Ativa:** ${t.is_active ? 'sim' : 'não'}\n- **Uso:** ${t.usage_count ?? 0}\n\n${t.description ?? ''}\n`;
}

function projectToHtml(p: any, related: any): string {
  const techs = Array.isArray(p.technologies) ? p.technologies : [];
  const tags = Array.isArray(p.tags) ? p.tags : [];
  return htmlShell(`Projeto — ${p.title || p.slug}`, `
    <h1>${escapeHtml(p.title || 'Projeto')}</h1>
    <p class="meta">${escapeHtml(p.client_name || 'Sem cliente')} · ${escapeHtml(p.pipeline_stage || p.status || '')}</p>
    <div class="kpi-grid">
      <div class="kpi"><div class="label">Estágios</div><div class="value">${related.stages.length}</div></div>
      <div class="kpi"><div class="label">Transações</div><div class="value">${related.transactions.length}</div></div>
      <div class="kpi"><div class="label">Horas</div><div class="value">${(related.time_entries.reduce((a: number, e: any) => a + (e.duration_minutes || 0), 0) / 60).toFixed(1)}h</div></div>
      <div class="kpi"><div class="label">Anexos</div><div class="value">${related.attachments.length}</div></div>
    </div>
    <h2>Descrição</h2><p>${escapeHtml(p.description || '')}</p>
    ${p.long_description ? `<h2>Descrição completa</h2><p>${escapeHtml(p.long_description)}</p>` : ''}
    <h2>Tecnologias</h2><p>${techs.map((t: any) => `<span class="badge">${escapeHtml(typeof t === 'string' ? t : t?.name || t?.slug)}</span>`).join(' ') || '—'}</p>
    <h2>Tags</h2><p>${tags.map((t: any) => `<span class="badge">${escapeHtml(t)}</span>`).join(' ') || '—'}</p>
    <h2>Dados relacionados</h2>
    <h3>Orçamento</h3><pre>${escapeHtml(JSON.stringify(related.budget, null, 2))}</pre>
    <h3>Estágios</h3>${rowsToHtmlTable(related.stages)}
    <h3>Transações</h3>${rowsToHtmlTable(related.transactions)}
    <h3>Horas</h3>${rowsToHtmlTable(related.time_entries)}
  `);
}

function rowsToHtmlTable(rows: any[]): string {
  if (!rows?.length) return '<p class="empty">Sem registros</p>';
  const cols = Object.keys(rows[0]).slice(0, 8);
  return '<div class="tbl-wrap"><table><thead><tr>' + cols.map(c => `<th>${escapeHtml(c)}</th>`).join('') + '</tr></thead><tbody>' +
    rows.slice(0, 100).map(r => '<tr>' + cols.map(c => `<td>${escapeHtml(escCell(r[c]))}</td>`).join('') + '</tr>').join('') +
    '</tbody></table></div>';
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
    const seenAssets = new Set<string>();
    const exportWarnings: string[] = [];

    // 🧠 Inventário definitivo: usa todas as seções conhecidas + tenta descobrir extras.
    let domainsToRun: Record<string, string[]>;
    if (onlyDomain) {
      domainsToRun = { [onlyDomain]: DOMAINS[onlyDomain] || [] };
    } else {
      const knownTables = new Set<string>(PUBLIC_TABLES);
      try {
        const { data: schemaTables } = await supa
          .from('pg_tables' as any)
          .select('tablename')
          .eq('schemaname', 'public');
        for (const t of (schemaTables as any[]) ?? []) knownTables.add(t.tablename);
      } catch { /* pg_tables pode não estar exposto — segue com inventário SevenOS */ }

      domainsToRun = { ...DOMAINS };
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
          const rows = await fetchAllRows(supa, t);
          domainDump[t] = rows;
          fullDump[t] = rows;
          counts[t] = rows.length;
          totalRows += rows.length;
          if (!allTables.includes(t)) allTables.push(t);
          // CSV por tabela
          if (rows.length) files.push({ name: `${domain}/csv/${t}.csv`, data: enc.encode(toCsv(rows)) });
        } catch (e: any) {
          const msg = e?.message || 'fail';
          domainDump[t] = { _error: msg }; counts[t] = 0; exportWarnings.push(`${domain}/${t}: ${msg}`);
        }
      }
      summary[domain] = { tables: counts, total: totalRows };
      files.push({ name: `${domain}/data.json`, data: enc.encode(JSON.stringify(domainDump, null, 2)) });
      files.push({ name: `${domain}/report.md`, data: enc.encode(domainToMarkdown(domain, domainDump)) });
      const html = domainToHtml(domain, domainDump);
      files.push({ name: `${domain}/report.html`, data: enc.encode(html) });
      // .doc = HTML servido como Word (Word abre nativamente)
      files.push({ name: `${domain}/report.doc`, data: enc.encode(html) });
      files.push({ name: `${domain}/report.pdf`, data: domainToPdf(domain, domainDump) });
    }

    // 🧬 Catálogo reaproveitável de tecnologias e tags — inclui SVG fallback para tudo.
    if (!onlyDomain || onlyDomain === 'registry' || onlyDomain === 'projects') {
      const techRows = fullDump.tech_registry ?? [];
      const tagRows = fullDump.tag_registry ?? [];
      const techIndex = techRows.map((t: any) => ({
        slug: t.slug, name: t.name, category: t.category, color: t.color, icon_url: t.icon_url,
        files: [`registry/technologies/${safeSlug(t.slug || t.name)}/data.json`, `registry/technologies/${safeSlug(t.slug || t.name)}/README.md`, `registry/technologies/${safeSlug(t.slug || t.name)}/badge.svg`],
      }));
      const tagIndex = tagRows.map((t: any) => ({
        slug: t.slug, name: t.name, color: t.color, icon_url: t.icon_url,
        files: [`registry/tags/${safeSlug(t.slug || t.name)}/data.json`, `registry/tags/${safeSlug(t.slug || t.name)}/README.md`, `registry/tags/${safeSlug(t.slug || t.name)}/badge.svg`],
      }));
      files.push({ name: 'registry/technologies/index.json', data: enc.encode(JSON.stringify(techIndex, null, 2)) });
      files.push({ name: 'registry/tags/index.json', data: enc.encode(JSON.stringify(tagIndex, null, 2)) });
      files.push({ name: 'registry/technologies/catalog.csv', data: enc.encode(toCsv(techRows)) });
      files.push({ name: 'registry/tags/catalog.csv', data: enc.encode(toCsv(tagRows)) });
      for (const t of techRows) {
        const folder = `registry/technologies/${safeSlug(t.slug || t.name || t.id)}`;
        files.push({ name: `${folder}/data.json`, data: enc.encode(JSON.stringify(t, null, 2)) });
        files.push({ name: `${folder}/README.md`, data: enc.encode(techToMarkdown(t)) });
        files.push({ name: `${folder}/badge.svg`, data: enc.encode(iconBadgeSvg(t.name || t.slug, t.color, t.slug)) });
        if (includeFiles) await addUrlAsset(supa, files, t.icon_url, `${folder}/assets`, seenAssets, `${safeSlug(t.slug || t.name)}-icon`);
      }
      for (const t of tagRows) {
        const folder = `registry/tags/${safeSlug(t.slug || t.name || t.id)}`;
        files.push({ name: `${folder}/data.json`, data: enc.encode(JSON.stringify(t, null, 2)) });
        files.push({ name: `${folder}/README.md`, data: enc.encode(tagToMarkdown(t)) });
        files.push({ name: `${folder}/badge.svg`, data: enc.encode(iconBadgeSvg(t.name || t.slug, t.color, 'TAG')) });
        if (includeFiles) await addUrlAsset(supa, files, t.icon_url, `${folder}/assets`, seenAssets, `${safeSlug(t.slug || t.name)}-icon`);
      }
    }

    // 🎨 Logo Lab / Branding — materializa SVG inline, URLs e paletas em pastas próprias.
    if (!onlyDomain || onlyDomain === 'branding') {
      for (const b of fullDump.branding_assets ?? []) {
        const folder = `branding/logo-lab/${safeSlug(b.slug || b.id)}`;
        files.push({ name: `${folder}/data.json`, data: enc.encode(JSON.stringify(b, null, 2)) });
        files.push({ name: `${folder}/palette.json`, data: enc.encode(JSON.stringify({ slug: b.slug, color: b.color, palette: b.palette ?? [] }, null, 2)) });
        if (b.custom_svg) files.push({ name: `${folder}/custom.svg`, data: enc.encode(String(b.custom_svg)) });
        else files.push({ name: `${folder}/badge.svg`, data: enc.encode(iconBadgeSvg(b.slug || 'Logo', b.color || '#ffffff', 'LOGO')) });
        if (includeFiles) await addUrlAsset(supa, files, b.custom_url, `${folder}/assets`, seenAssets, `${safeSlug(b.slug)}-logo`);
      }
      for (const v of fullDump.logo_variations ?? []) {
        const folder = `branding/logo-variations/${safeSlug(v.slug || v.name || v.id)}/${safeSlug(v.variant_kind || 'variation')}`;
        files.push({ name: `${folder}/data.json`, data: enc.encode(JSON.stringify(v, null, 2)) });
        if (includeFiles) await addUrlAsset(supa, files, v.image_url, `${folder}/assets`, seenAssets, `${safeSlug(v.slug || v.name)}-${safeSlug(v.variant_kind || 'variation')}`);
      }
    }

    // 📁 Pastas dedicadas POR PROJETO (crown jewel)
    if ((!onlyDomain || onlyDomain === 'projects') && fullDump.projects?.length) {
      for (const p of fullDump.projects) {
        const slug = safeSlug(p.slug || p.title || p.id);
        const folder = `by-project/${slug}`;
        const related: any = {
          project: p,
          client: fullDump.clients?.find((x: any) => x.id === p.client_id || x.name === p.client_name) ?? null,
          budget: fullDump.project_budgets?.filter((x: any) => x.project_id === p.id) ?? [],
          stages: fullDump.project_stages?.filter((x: any) => x.project_id === p.id) ?? [],
          checklist_items: fullDump.stage_checklist_items?.filter((x: any) => (fullDump.project_stages ?? []).some((s: any) => s.project_id === p.id && s.id === x.stage_id)) ?? [],
          documents: fullDump.stage_documents?.filter((x: any) => (fullDump.project_stages ?? []).some((s: any) => s.project_id === p.id && s.id === x.stage_id) || x.project_id === p.id) ?? [],
          pipeline_log: fullDump.pipeline_stage_log?.filter((x: any) => x.project_id === p.id) ?? [],
          transactions: fullDump.transactions?.filter((x: any) => x.project_id === p.id) ?? [],
          time_entries: fullDump.time_entries?.filter((x: any) => x.project_id === p.id) ?? [],
          attachments: fullDump.attachments?.filter((x: any) => x.entity_id === p.id) ?? [],
          contract_versions: fullDump.contract_versions?.filter((x: any) => x.entity_id === p.id) ?? [],
        };
        files.push({ name: `${folder}/project.json`, data: enc.encode(JSON.stringify(related, null, 2)) });
        const techLines = (Array.isArray(p.technologies) ? p.technologies : []).map((t: any) => `- ${typeof t === 'string' ? t : `${t?.name ?? t?.slug ?? 'Tech'} ${t?.color ? `(${t.color})` : ''}`}`).join('\n') || '—';
        const tagLines = (Array.isArray(p.tags) ? p.tags : []).map((t: any) => `- ${t}`).join('\n') || '—';
        const md = [
          `# ${p.title || 'Projeto'}`,
          '',
          `**Cliente:** ${p.client_name ?? related.client?.name ?? '—'}`,
          `**Stage:** ${p.pipeline_stage ?? '—'}`,
          `**Status:** ${p.status ?? '—'}`,
          `**Publicado:** ${p.is_published_on_site ? 'sim' : 'não'}`,
          `**URL:** ${p.live_url ?? '—'}`,
          '',
          p.description ? `## Descrição\n\n${p.description}` : '',
          p.long_description ? `## Descrição completa\n\n${p.long_description}` : '',
          p.subtitle ? `> ${p.subtitle}` : '',
          '## Tecnologias', techLines,
          '## Tags', tagLines,
          '## Orçamento', JSON.stringify(related.budget, null, 2),
          `## Estágios (${related.stages.length})`, related.stages.map((s: any) => `- **${s.name || s.title || s.id}** — ${s.status ?? ''}`).join('\n') || '—',
          `## Checklist (${related.checklist_items.length})`, related.checklist_items.map((i: any) => `- [${i.completed ? 'x' : ' '}] ${i.title || i.name || i.id}`).join('\n') || '—',
          `## Documentos (${related.documents.length})`, related.documents.map((d: any) => `- ${d.title || d.file_name || d.name || d.id} · ${d.storage_path ?? d.file_url ?? d.url ?? ''}`).join('\n') || '—',
          `## Transações (${related.transactions.length})`, related.transactions.map((t: any) => `- ${t.occurred_at?.slice(0, 10)} · ${t.kind} · R$ ${t.amount_brl} · ${t.description ?? ''}`).join('\n') || '—',
          `## Horas (${related.time_entries.length})`, `Total: ${related.time_entries.reduce((a: number, e: any) => a + (e.duration_minutes || 0), 0) / 60}h`,
          `## Anexos (${related.attachments.length})`, related.attachments.map((a: any) => `- ${a.file_name} · ${a.metadata?.storage_path ?? a.file_url}`).join('\n') || '—',
        ].filter(Boolean).join('\n\n');
        files.push({ name: `${folder}/README.md`, data: enc.encode(md) });
        const html = projectToHtml(p, related);
        files.push({ name: `${folder}/report.html`, data: enc.encode(html) });
        files.push({ name: `${folder}/report.doc`, data: enc.encode(html) });
        files.push({ name: `${folder}/summary.pdf`, data: buildSimplePdf(`Projeto — ${p.title || slug}`, md.split('\n')) });
        if (includeFiles) {
          await addUrlAsset(supa, files, p.cover_image, `${folder}/assets`, seenAssets, `${slug}-cover`);
          const urls: { field: string; url: string }[] = [];
          collectUrls(p.gallery, urls, 'gallery');
          collectUrls(p.technologies, urls, 'technologies');
          for (const u of urls) await addUrlAsset(supa, files, u.url, `${folder}/assets`, seenAssets, `${slug}-${u.field}`);
          for (const a of related.attachments) {
            const storagePath = a?.metadata?.storage_path || a?.storage_path;
            if (storagePath) await addStorageAsset(supa, files, 'attachments', storagePath, `${folder}/attachments`, seenAssets, a.file_name || storagePath);
            await addUrlAsset(supa, files, a?.file_url, `${folder}/attachments`, seenAssets, a.file_name || 'attachment');
          }
          for (const d of related.documents) {
            const storagePath = d?.metadata?.storage_path || d?.storage_path;
            if (storagePath) await addStorageAsset(supa, files, 'attachments', storagePath, `${folder}/documents`, seenAssets, d.file_name || d.title || storagePath);
            await addUrlAsset(supa, files, d?.file_url || d?.url, `${folder}/documents`, seenAssets, d.file_name || d.title || 'document');
          }
        }
      }
    }

    // 🔗 Assets linkados em qualquer campo do banco (cover_image, icon_url, image_url, file_url, custom_url etc.)
    const linkedAssets: any[] = [];
    if (includeFiles) {
      for (const [table, rows] of Object.entries(fullDump)) {
        for (const r of rows) {
          const base = `linked-assets/${table}/${safeSlug(r.id || r.slug || r.name || r.title || 'row')}`;
          const urls: { field: string; url: string }[] = [];
          collectUrls(r, urls, table);
          for (const u of urls) {
            const ok = await addUrlAsset(supa, files, u.url, base, seenAssets, `${safeSlug(u.field)}-${safeFileName(u.url)}`);
            if (ok) linkedAssets.push({ table, id: r.id, field: u.field, url: u.url, folder: base });
          }
          const storagePath = r?.storage_path || r?.metadata?.storage_path;
          const bucket = r?.bucket || r?.bucket_id || (['attachments', 'stage_documents'].includes(table) ? 'attachments' : null);
          if (typeof storagePath === 'string' && bucket && !/^https?:\/\//i.test(storagePath)) {
            const ok = await addStorageAsset(supa, files, bucket, storagePath, base, seenAssets, safeFileName(r.file_name || r.name || storagePath));
            if (ok) linkedAssets.push({ table, id: r.id, field: 'storage_path', bucket, path: storagePath, folder: base });
          }
        }
      }
      files.push({ name: 'linked-assets/index.json', data: enc.encode(JSON.stringify(linkedAssets, null, 2)) });
      summary.linked_assets = { tables: { downloaded: linkedAssets.length }, total: linkedAssets.length };
    }

    // 🔎 Índice de busca global completo
    for (const [table, rows] of Object.entries(fullDump)) {
      for (const r of rows) {
        const title = r.title || r.name || r.subject || r.email || r.id;
        if (!title) continue;
        searchIndex.push({
          table, id: r.id, title: String(title).slice(0, 140),
          subtitle: String(r.subtitle || r.description || r.company || r.client_name || r.slug || '').slice(0, 240),
          created_at: r.created_at, updated_at: r.updated_at,
        });
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
    const totalRows = Object.entries(summary).filter(([k]) => !['storage', 'linked_assets'].includes(k)).reduce((s, [, d]) => s + d.total, 0);
    const totalFiles = (summary.storage?.total ?? 0) + (summary.linked_assets?.total ?? 0);
    const kpis = `
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Tabelas</div><div class="value">${allTables.length}</div></div>
        <div class="kpi"><div class="label">Registros totais</div><div class="value">${totalRows.toLocaleString('pt-BR')}</div></div>
        <div class="kpi"><div class="label">Domínios</div><div class="value">${Object.keys(domainsToRun).length}</div></div>
        <div class="kpi"><div class="label">Arquivos/Assets</div><div class="value">${totalFiles}</div></div>
        <div class="kpi"><div class="label">Projetos</div><div class="value">${fullDump.projects?.length ?? 0}</div></div>
        <div class="kpi"><div class="label">Tecnologias</div><div class="value">${fullDump.tech_registry?.length ?? 0}</div></div>
        <div class="kpi"><div class="label">Tags</div><div class="value">${fullDump.tag_registry?.length ?? 0}</div></div>
        <div class="kpi"><div class="label">Logo Lab</div><div class="value">${fullDump.branding_assets?.length ?? 0}</div></div>
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
        <li><code>&lt;dominio&gt;/report.html</code> / <code>.doc</code> / <code>.pdf</code> — leitura executiva</li>
        <li><code>&lt;dominio&gt;/report.md</code> — legível em qualquer editor</li>
        <li><code>by-project/&lt;slug&gt;/</code> — pasta dedicada por projeto</li>
        <li><code>registry/technologies</code> e <code>registry/tags</code> — catálogos com SVGs e assets</li>
        <li><code>branding/logo-lab</code> — Logo Lab, SVG inline, variações IA e paletas</li>
        <li><code>linked-assets/</code> — todo asset encontrado em campos do banco</li>
        <li><code>storage/&lt;bucket&gt;/</code> — arquivos reais (SVGs, logos, imagens)</li>
        <li><code>search-index.json</code> — índice de busca global</li>
      </ul>`);
    files.push({ name: 'dashboard.html', data: enc.encode(dashHtml) });
    files.push({ name: 'dashboard.doc', data: enc.encode(dashHtml) });
    files.push({ name: 'dashboard.pdf', data: buildSimplePdf('SevenOS Backup — Snapshot Executivo', [
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      `Tabelas: ${allTables.length}`,
      `Registros: ${totalRows}`,
      `Arquivos/assets: ${totalFiles}`,
      `Projetos: ${fullDump.projects?.length ?? 0}`,
      `Tecnologias: ${fullDump.tech_registry?.length ?? 0}`,
      `Tags: ${fullDump.tag_registry?.length ?? 0}`,
      `Logo Lab: ${fullDump.branding_assets?.length ?? 0}`,
      '',
      ...Object.entries(summary).flatMap(([d, s]) => [`${d}: ${s.total}`, ...Object.entries(s.tables).slice(0, 12).map(([t, n]) => `  - ${t}: ${n}`)]),
    ]) });

    const manifest = {
      exported_at: new Date().toISOString(), by: user.email, version: 6,
      domains: Object.keys(domainsToRun), summary,
      totals: { tables: allTables.length, rows: totalRows, files: totalFiles, zip_entries: files.length },
      formats: ['json', 'csv', 'markdown', 'html', 'doc', 'pdf', 'svg', 'original-assets'],
      includes_binaries: includeFiles,
      warnings: exportWarnings,
    };
    files.push({ name: 'manifest.json', data: enc.encode(JSON.stringify(manifest, null, 2)) });
    files.push({
      name: 'README.md',
      data: enc.encode(`# 📦 SevenOS Backup v6 — Backup Definitivo SevenOS

**Exportado:** ${manifest.exported_at}
**Por:** ${user.email}
**Escopo:** ${onlyDomain ? `Domínio \`${onlyDomain}\`` : 'SISTEMA COMPLETO'}

## 📊 Números
- **${allTables.length}** tabelas
- **${totalRows.toLocaleString('pt-BR')}** registros
- **${totalFiles}** arquivos/assets resolvidos
- **${Object.keys(domainsToRun).length}** domínios
- **${fullDump.tech_registry?.length ?? 0}** tecnologias
- **${fullDump.tag_registry?.length ?? 0}** tags
- **${fullDump.branding_assets?.length ?? 0}** itens do Logo Lab

## 📂 Estrutura

\`\`\`
📦 backup.zip
├── dashboard.html            ← 🎯 comece por aqui (executivo com KPIs)
├── dashboard.doc             ← Word/Pages
├── dashboard.pdf             ← PDF executivo real
├── manifest.json             ← metadados
├── search-index.json         ← índice global de busca
├── storage-inventory.json    ← inventário dos buckets
├── README.md                 ← este arquivo
│
├── <dominio>/                (projects, crm, finance, cms, ops, branding, integrations, automations, security, misc)
│   ├── data.json             ← dados brutos completos (reimportáveis)
│   ├── report.md             ← Markdown legível (GitHub/Obsidian)
│   ├── report.html           ← navegável/imprimível
│   ├── report.doc            ← abre no Word/Pages
│   ├── report.pdf            ← PDF resumo do domínio
│   └── csv/<tabela>.csv      ← 1 CSV por tabela (Excel/Sheets)
│
├── by-project/<slug>/        ← pasta dedicada POR PROJETO
│   ├── project.json          ← dados + orçamento + estágios + tx + horas + anexos + contratos
│   ├── README.md             ← ficha legível do projeto
│   ├── report.html/.doc      ← ficha visual reaproveitável
│   ├── summary.pdf           ← PDF do projeto
│   ├── assets/               ← capa/galeria/tecnologias linkadas
│   ├── attachments/          ← anexos privados
│   └── documents/            ← documentos de etapas
│
├── registry/
│   ├── technologies/         ← cada tecnologia com JSON + MD + badge.svg + ícone original
│   └── tags/                 ← cada tag com JSON + MD + badge.svg + ícone original
│
├── branding/
│   ├── logo-lab/             ← overrides, SVG inline, paletas e URLs customizadas
│   └── logo-variations/      ← variações IA do Logo Lab
│
├── linked-assets/            ← assets encontrados em qualquer campo do banco
│
└── storage/                  ← arquivos reais dos buckets
    ├── tech-icons/           ← SVGs das tecnologias
    ├── project-images/       ← imagens dos projetos
    ├── blog-images/          ← imagens do blog
    └── attachments/          ← anexos privados de contratos/CRM
\`\`\`

## 💡 Formatos incluídos

| Formato | Uso |
|---------|-----|
| JSON    | Reimportação, integração, scripts |
| CSV     | Excel, Google Sheets, análise |
| Markdown| GitHub, Obsidian, VS Code, docs |
| HTML    | Navegador, preview visual, impressão |
| DOC     | Microsoft Word, Pages, LibreOffice |
| PDF     | Resumos executivos reais |
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
