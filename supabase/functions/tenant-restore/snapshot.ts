import { unzipSync } from 'npm:fflate@0.8.2';

const MAX_ARCHIVE_BYTES = 32 * 1024 * 1024;
const MAX_JSON_BYTES = 16 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Parse the JSON snapshots exported by SevenOS; assets are never decompressed.
export function decodeSnapshot(bytes: Uint8Array, tables: string[]): Record<string, Record<string, unknown>[]> {
  if (!bytes.length || bytes.length > MAX_ARCHIVE_BYTES) throw new Error('Backup size unsupported');
  const snapshot: Record<string, unknown> = Object.create(null);
  const merge = (data: unknown) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid snapshot');
    for (const table of tables) {
      if (Object.hasOwn(data, table)) {
        if (Object.hasOwn(snapshot, table)) {
          // Full exports repeat project_budgets in projects and finance.
          if (JSON.stringify(snapshot[table]) !== JSON.stringify((data as Record<string, unknown>)[table])) throw new Error('Conflicting table snapshots');
          continue;
        }
        snapshot[table] = (data as Record<string, unknown>)[table];
      }
    }
  };
  const parse = (data: Uint8Array) => {
    if (data.length > MAX_JSON_BYTES) throw new Error('Snapshot size unsupported');
    merge(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data)));
  };
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    let total = 0;
    const names = new Set<string>();
    const files = unzipSync(bytes, { filter: file => {
      if (!/^(?:data\.json|[a-z][a-z0-9-]*\/data\.json)$/.test(file.name)) return false;
      if (names.has(file.name)) throw new Error('Duplicate snapshot file');
      names.add(file.name);
      total += file.originalSize;
      if (total > MAX_JSON_BYTES) throw new Error('Snapshot size unsupported');
      return true;
    } });
    for (const file of Object.values(files)) parse(file);
  } else parse(bytes);
  const result: Record<string, Record<string, unknown>[]> = Object.create(null);
  for (const table of tables) {
    const rows = snapshot[table];
    if (!Array.isArray(rows)) throw new Error('Selected table missing or invalid');
    if (rows.length > 10000) throw new Error('Too many rows');
    const ids = new Set<string>();
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row) || typeof row.id !== 'string' || !UUID.test(row.id) || ids.has(row.id)) throw new Error('Invalid or duplicate row identity');
      ids.add(row.id);
    }
    result[table] = rows;
  }
  return result;
}