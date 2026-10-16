import assert from 'node:assert/strict';
import { zipSync } from 'npm:fflate@0.8.2';
import { decodeSnapshot } from '../supabase/functions/tenant-restore/snapshot.ts';
const data = new TextEncoder().encode(JSON.stringify({projects:[{id:'00000000-0000-0000-0000-000000000001',title:'Synthetic'}]}));
Deno.test('native Deno reads JSON and stored/deflated backup snapshots',()=>{
  const expected = decodeSnapshot(data,['projects']);
  for (const level of [0,6] as const) assert.deepEqual(decodeSnapshot(zipSync({'projects/data.json':data},{level}),['projects']),expected);
});
Deno.test('native Deno rejects truncated archive and invalid selected snapshot',()=>{
  const archive = zipSync({'projects/data.json':data});
  assert.throws(()=>decodeSnapshot(archive.subarray(0,archive.length-3),['projects']));
  assert.throws(()=>decodeSnapshot(data,['clients']));
});