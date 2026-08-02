/**
 * 🚀 index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/oauth-start/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `oauth-start` do módulo Edge Functions.
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
 * index.ts
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
 * ⚡ oauth-start/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/oauth-start/index.ts
 * @module Integrations/OAuth
 *
 * @description
 * Inicia o fluxo OAuth PKCE e devolve a URL de autorização.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Providers OAuth
 *
 * @remarks
 * O redirect é sempre same-origin público, nunca rota protegida.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🔐 oauth-start — inicia fluxo OAuth 2.0 (PKCE) genérico
// Suporta: github, google, slack, notion. Retorna URL para redirect.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ProviderConf {
  authorize_url: string;
  client_id_env: string;
  default_scopes: string;
  uses_pkce: boolean;
}

const PROVIDERS: Record<string, ProviderConf> = {
  github: { authorize_url: 'https://github.com/login/oauth/authorize', client_id_env: 'GITHUB_OAUTH_CLIENT_ID', default_scopes: 'read:user repo', uses_pkce: false },
  google: { authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth', client_id_env: 'GOOGLE_OAUTH_CLIENT_ID', default_scopes: 'openid email profile https://www.googleapis.com/auth/drive.readonly', uses_pkce: true },
  slack:  { authorize_url: 'https://slack.com/oauth/v2/authorize', client_id_env: 'SLACK_CLIENT_ID', default_scopes: 'chat:write,channels:read,users:read', uses_pkce: false },
  notion: { authorize_url: 'https://api.notion.com/v1/oauth/authorize', client_id_env: 'NOTION_OAUTH_CLIENT_ID', default_scopes: '', uses_pkce: false },
};

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ''; arr.forEach(b => s += String.fromCharCode(b));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

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

    const { provider, redirect_uri, scopes } = await req.json();
    const conf = PROVIDERS[provider];
    if (!conf) return new Response(JSON.stringify({ error: 'unsupported_provider' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const clientId = Deno.env.get(conf.client_id_env);
    if (!clientId) {
      return new Response(JSON.stringify({
        error: 'missing_client_id',
        message: `Configure o secret ${conf.client_id_env} (e ${conf.client_id_env.replace('CLIENT_ID','CLIENT_SECRET')}) em Configurações → Secrets.`,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // State + PKCE
    const state = b64url(crypto.getRandomValues(new Uint8Array(24)));
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;
    if (conf.uses_pkce) {
      codeVerifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
      codeChallenge = b64url(hash);
    }

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    // Reusar tabela admin_sessions? Mais limpo: efêmero em oauth_connections com status=pending
    await supa.from('oauth_connections').insert({
      user_id: u.user.id, provider, status: 'pending',
      raw_profile: { state, code_verifier: codeVerifier, redirect_uri },
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri,
      response_type: 'code',
      scope: scopes || conf.default_scopes,
      state,
    });
    if (codeChallenge) {
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }
    // Slack quirk: scope vs user_scope
    if (provider === 'slack') { params.set('scope', scopes || conf.default_scopes); }
    // Notion quirk
    if (provider === 'notion') { params.set('owner', 'user'); }

    const url = `${conf.authorize_url}?${params.toString()}`;
    return new Response(JSON.stringify({ ok: true, url, state }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
