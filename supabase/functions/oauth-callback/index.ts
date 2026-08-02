/**
 * 🚀 oauth-callback/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/oauth-callback/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `oauth-callback` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `oauth_connections`
 * ✅ Invoca RPC: `has_role`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `oauth-callback`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ O papel administrativo é verificado via RPC `has_role` (SECURITY DEFINER)
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 A autoridade final é a RLS do banco, não o corpo da requisição
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
 * ⚡ oauth-callback/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/oauth-callback/index.ts
 * @module Integrations/OAuth
 *
 * @description
 * Conclui o fluxo OAuth PKCE e persiste a conexão.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Providers OAuth
 *
 * @remarks
 * Valida o state/verifier antes de trocar o código por token.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🔐 oauth-callback — finaliza fluxo OAuth: troca code por token e persiste.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const TOKEN_ENDPOINTS: Record<string, { url: string; client_id_env: string; client_secret_env: string; profile_url?: string; profile_headers?: (tok: string) => Record<string,string> }> = {
  github: {
    url: 'https://github.com/login/oauth/access_token',
    client_id_env: 'GITHUB_OAUTH_CLIENT_ID', client_secret_env: 'GITHUB_OAUTH_CLIENT_SECRET',
    profile_url: 'https://api.github.com/user',
    profile_headers: (tok) => ({ Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json' }),
  },
  google: {
    url: 'https://oauth2.googleapis.com/token',
    client_id_env: 'GOOGLE_OAUTH_CLIENT_ID', client_secret_env: 'GOOGLE_OAUTH_CLIENT_SECRET',
    profile_url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    profile_headers: (tok) => ({ Authorization: `Bearer ${tok}` }),
  },
  slack: {
    url: 'https://slack.com/api/oauth.v2.access',
    client_id_env: 'SLACK_CLIENT_ID', client_secret_env: 'SLACK_CLIENT_SECRET',
  },
  notion: {
    url: 'https://api.notion.com/v1/oauth/token',
    client_id_env: 'NOTION_OAUTH_CLIENT_ID', client_secret_env: 'NOTION_OAUTH_CLIENT_SECRET',
  },
};

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin } = await uc.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { provider, code, state, redirect_uri } = await req.json();
    const tep = TOKEN_ENDPOINTS[provider];
    if (!tep) return new Response(JSON.stringify({ error: 'unsupported_provider' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const clientId = Deno.env.get(tep.client_id_env);
    const clientSecret = Deno.env.get(tep.client_secret_env);
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'missing_credentials' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    // Require a matching pending row started by this admin (state binding is mandatory)
    const { data: pending } = await supa.from('oauth_connections')
      .select('*').eq('user_id', u.user.id).eq('provider', provider).eq('status', 'pending')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!pending) {
      return new Response(JSON.stringify({ error: 'no_pending_request' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const codeVerifier = pending?.raw_profile?.code_verifier;
    if (!pending?.raw_profile?.state || pending.raw_profile.state !== state) {
      return new Response(JSON.stringify({ error: 'state_mismatch' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }


    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code, redirect_uri, grant_type: 'authorization_code',
    });
    if (codeVerifier) body.set('code_verifier', codeVerifier);

    const tokRes = await fetch(tep.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body,
    });
    const tok = await tokRes.json();
    if (!tokRes.ok || tok.error) {
      return new Response(JSON.stringify({ error: 'token_exchange_failed', detail: tok }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let profile: any = {};
    if (tep.profile_url && tep.profile_headers && tok.access_token) {
      try {
        const pr = await fetch(tep.profile_url, { headers: tep.profile_headers(tok.access_token) });
        profile = await pr.json();
      } catch {}
    } else if (provider === 'slack') {
      profile = { team: tok.team, authed_user: tok.authed_user };
    } else if (provider === 'notion') {
      profile = { workspace_id: tok.workspace_id, workspace_name: tok.workspace_name, bot_id: tok.bot_id };
    }

    const email = profile.email || profile.authed_user?.id || profile.workspace_id || `${provider}-${Date.now()}`;
    const name = profile.name || profile.login || profile.team?.name || profile.workspace_name || provider;
    const avatar = profile.avatar_url || profile.picture || profile.team?.icon?.image_132 || null;
    const expiresAt = tok.expires_in ? new Date(Date.now() + tok.expires_in * 1000).toISOString() : null;

    // Replace pending with active
    if (pending?.id) await supa.from('oauth_connections').delete().eq('id', pending.id);
    const { data: row, error: insErr } = await supa.from('oauth_connections').upsert({
      user_id: u.user.id, provider,
      account_email: email, account_name: name, account_avatar: avatar,
      scopes: typeof tok.scope === 'string' ? tok.scope.split(/[ ,]+/) : null,
      access_token: tok.access_token,
      refresh_token: tok.refresh_token || null,
      token_type: tok.token_type || 'Bearer',
      expires_at: expiresAt,
      raw_profile: profile,
      status: 'active', last_refreshed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider,account_email' }).select().single();
    if (insErr) return new Response(JSON.stringify({ error: insErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    return new Response(JSON.stringify({ ok: true, connection: { id: row.id, account_email: row.account_email, account_name: row.account_name } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
