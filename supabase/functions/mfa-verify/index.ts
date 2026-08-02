/**
 * 🚀 index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/mfa-verify/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `mfa-verify` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `user_mfa`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * index.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚡ mfa-verify/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/mfa-verify/index.ts
 * @module Security/MFA
 *
 * @description
 * Valida o código TOTP e ativa o MFA do usuário.
 *
 * @security
 * JWT do usuário. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * —
 *
 * @remarks
 * Backup codes são de uso único.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🔐 MFA Verify — valida código TOTP de 6 dígitos. Habilita MFA na primeira verificação válida.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

function base32Decode(s: string): Uint8Array {
  const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  s = s.toUpperCase().replace(/=+$/,'');
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const c of s) {
    const v = ALPH.indexOf(c);
    if (v < 0) continue;
    value = (value << 5) | v; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(out);
}

async function totp(secret: string, t = Math.floor(Date.now() / 30000)): Promise<string> {
  const key = await crypto.subtle.importKey('raw', base32Decode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const counter = new ArrayBuffer(8);
  new DataView(counter).setUint32(4, t, false);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, counter));
  const offset = sig[sig.length - 1] & 0xf;
  const code = ((sig[offset] & 0x7f) << 24 | sig[offset + 1] << 16 | sig[offset + 2] << 8 | sig[offset + 3]) % 1000000;
  return code.toString().padStart(6, '0');
}

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });

    const { code } = await req.json();
    if (!code) return new Response(JSON.stringify({ error: 'code_required' }), { status: 400, headers: corsHeaders });

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: mfa } = await supa.from('user_mfa').select('*').eq('user_id', user.id).maybeSingle();
    if (!mfa) return new Response(JSON.stringify({ error: 'not_enrolled' }), { status: 400, headers: corsHeaders });

    const now = Math.floor(Date.now() / 30000);
    let ok = false;
    for (const offset of [-1, 0, 1]) {
      if (await totp(mfa.secret_encrypted, now + offset) === String(code).trim()) { ok = true; break; }
    }
    let usedBackup = false;
    if (!ok && Array.isArray(mfa.backup_codes) && mfa.backup_codes.includes(String(code).toUpperCase())) {
      ok = true; usedBackup = true;
      await supa.from('user_mfa').update({
        backup_codes: mfa.backup_codes.filter((c: string) => c !== String(code).toUpperCase()),
      }).eq('user_id', user.id);
    }
    if (!ok) return new Response(JSON.stringify({ verified: false }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    await supa.from('user_mfa').update({
      enabled_at: mfa.enabled_at ?? new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    return new Response(JSON.stringify({ verified: true, used_backup: usedBackup }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
