// 🔐 MFA Enroll — gera secret TOTP + QR (otpauth) + backup codes.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function base32(buf: Uint8Array): string {
  const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, out = '';
  for (const b of buf) {
    value = (value << 8) | b; bits += 8;
    while (bits >= 5) { out += ALPH[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPH[(value << (5 - bits)) & 31];
  return out;
}

function backupCode(): string {
  const a = new Uint8Array(5); crypto.getRandomValues(a);
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });

    const secret = new Uint8Array(20);
    crypto.getRandomValues(secret);
    const b32 = base32(secret);
    const codes = Array.from({ length: 10 }, backupCode);
    const issuer = 'SevenDevX';
    const label = encodeURIComponent(`${issuer}:${user.email}`);
    const otpauth = `otpauth://totp/${label}?secret=${b32}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    await supa.from('user_mfa').upsert({
      user_id: user.id,
      secret_encrypted: b32,
      backup_codes: codes,
      enabled_at: null,
    });

    return new Response(JSON.stringify({ secret: b32, otpauth, backup_codes: codes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
