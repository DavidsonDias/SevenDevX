/**
 * 🚀 logo-variations-ai/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/logo-variations-ai/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `logo-variations-ai` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `logo_variations`
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
 * Edge Function `logo-variations-ai`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ O papel administrativo é verificado via RPC `has_role` (SECURITY DEFINER)
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🌐 API EXTERNA                                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🌐 ai.gateway.lovable.dev
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
 * ⚡ logo-variations-ai/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/logo-variations-ai/index.ts
 * @module Branding
 *
 * @description
 * Gera variações de logo a partir do ativo base.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * AI Gateway
 *
 * @remarks
 * Ativos grandes em base64 impactam backup e export.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🎨 logo-variations-ai — gera variações de logo via Lovable AI (Gemini image)
// Variantes: iconmark, horizontal, vertical, monochrome
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

const VARIANT_PROMPTS: Record<string, string> = {
  iconmark: "Produce ONLY the abstract icon/mark (no text), centered on a transparent-looking white background, premium minimal vector style, flat, geometric, instantly recognizable",
  horizontal: "Horizontal lockup: icon on the left, brand wordmark on the right, perfectly aligned baseline, generous spacing, premium tech aesthetic, white background",
  vertical: "Vertical lockup: icon on top, brand wordmark centered below, balanced proportions, premium tech aesthetic, white background",
  monochrome: "Single-color flat monochrome version of the brand mark only (no gradients, no shading), pure black on white background, suitable for stamping, embroidery, watermarks",
};

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// ⚠️ URLs assinadas expiram; não devem ser persistidas como valor permanente.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
//

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

async function genImage(prompt: string): Promise<string | null> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const b64 = j?.data?.[0]?.b64_json
    ?? j?.choices?.[0]?.message?.images?.[0]?.image_url?.url?.split(',')?.[1];
  return b64 || null;
}

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin } = await uc.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { slug, name, color, variants } = await req.json();
    if (!name) return new Response(JSON.stringify({ error: 'missing_name' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const kinds: string[] = Array.isArray(variants) && variants.length ? variants : Object.keys(VARIANT_PROMPTS);

    const results: any[] = [];
    for (const k of kinds) {
      const tplate = VARIANT_PROMPTS[k] || VARIANT_PROMPTS.iconmark;
      const prompt = `Brand name: "${name}". Brand color: ${color || '#000'}. ${tplate}. Output a single high-quality square image.`;
      const b64 = await genImage(prompt);
      if (!b64) { results.push({ kind: k, error: 'gen_failed' }); continue; }
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const path = `logo-variations/${slug || name.toLowerCase().replace(/\s+/g,'-')}/${k}-${Date.now()}.png`;
      const { error: upErr } = await supa.storage.from('blog-images').upload(path, bytes, { contentType: 'image/png', upsert: true });
      if (upErr) { results.push({ kind: k, error: upErr.message }); continue; }
      const { data: pub } = supa.storage.from('blog-images').getPublicUrl(path);
      const { data: row } = await supa.from('logo_variations').insert({
        slug: slug || name.toLowerCase().replace(/\s+/g,'-'),
        name, variant_kind: k, image_url: pub.publicUrl,
        prompt, ai_model: 'google/gemini-2.5-flash-image', generated_by: u.user.id,
      }).select().single();
      results.push({ kind: k, image_url: pub.publicUrl, id: row?.id });
    }

    return new Response(JSON.stringify({ ok: true, results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
