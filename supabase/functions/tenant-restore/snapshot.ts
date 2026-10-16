import { unzipSync } from 'npm:fflate@0.8.2';

const MAX_ARCHIVE_BYTES = 32 * 1024 * 1024;
const MAX_JSON_BYTES = 16 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATA_FILE = /^(?:data\.json|[a-z][a-z0-9-]*\/data\.json)$/;
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let crc = n;
  for (let i = 0; i < 8; i++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
// Inspect ZIP32 bounds and checksums before parsing any selected JSON.
function zipChecksums(bytes: Uint8Array): Map<string, { crc: number; size: number }> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = bytes.length - 22;
  for (; end >= Math.max(0, bytes.length - 65558); end--) {
    if (view.getUint32(end, true) === 0x06054b50 && end + 22 + view.getUint16(end + 20, true) === bytes.length) break;
  }
  if (end < 0 || view.getUint32(end, true) !== 0x06054b50) throw new Error('Invalid ZIP directory');
  if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true)) throw new Error('Multidisk ZIP unsupported');
  const count = view.getUint16(end + 10, true);
  if (count === 65535 || count !== view.getUint16(end + 8, true)) throw new Error('ZIP64 unsupported');
  const directory = view.getUint32(end + 16, true);
  if (directory + view.getUint32(end + 12, true) !== end) throw new Error('Invalid ZIP bounds');
  const checks = new Map<string, { crc: number; size: number }>();
  let cursor = directory;
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > end || view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Invalid ZIP entry');
    const nameLength = view.getUint16(cursor + 28, true);
    const next = cursor + 46 + nameLength + view.getUint16(cursor + 30, true) + view.getUint16(cursor + 32, true);
    if (next > end) throw new Error('Invalid ZIP entry bounds');
    const name = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    if (DATA_FILE.test(name)) {
      if (checks.has(name) || view.getUint16(cursor + 8, true) & 1) throw new Error('Duplicate or encrypted snapshot');
      const offset = view.getUint32(cursor + 42, true);
      if (offset + 30 > directory || view.getUint32(offset, true) !== 0x04034b50) throw new Error('Invalid local ZIP entry');
      const localNameLength = view.getUint16(offset + 26, true);
      const dataStart = offset + 30 + localNameLength + view.getUint16(offset + 28, true);
      if (dataStart + view.getUint32(cursor + 20, true) > directory) throw new Error('Truncated ZIP data');
      const localName = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(offset + 30, offset + 30 + localNameLength));
      if (localName !== name || view.getUint16(offset + 8, true) !== view.getUint16(cursor + 10, true)) throw new Error('Conflicting ZIP headers');
      checks.set(name, { crc: view.getUint32(cursor + 16, true), size: view.getUint32(cursor + 24, true) });
    }
    cursor = next;
  }
  if (cursor !== end) throw new Error('Invalid ZIP directory size');
  return checks;
}

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
    const checks = zipChecksums(bytes);
    let total = 0;
    const names = new Set<string>();
    const files = unzipSync(bytes, { filter: file => {
      if (!DATA_FILE.test(file.name)) return false;
      if (names.has(file.name)) throw new Error('Duplicate snapshot file');
      names.add(file.name);
      total += file.originalSize;
      if (total > MAX_JSON_BYTES) throw new Error('Snapshot size unsupported');
      return true;
    } });
    for (const [name, file] of Object.entries(files)) {
      const check = checks.get(name);
      if (!check || file.length !== check.size || crc32(file) !== check.crc) throw new Error('Snapshot checksum mismatch');
      parse(file);
    }
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