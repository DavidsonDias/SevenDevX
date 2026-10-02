import { openAIRequest, textModel } from '../_shared/openai.ts';
/**
 * 🚀 citation-monitor/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/citation-monitor/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Monitora citações da marca em respostas de IAs e buscadores.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `citation_monitor_settings`, `ai_citations`
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
 * Edge Function `citation-monitor`
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
 * 🌐 api.openai.com
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

// Citation Monitor — Edge Function
// Pergunta para o OpenAI API (vários modelos) sobre a SevenDevX
// e registra automaticamente em `ai_citations` se foi mencionada.
//
// Pode ser chamada manualmente (POST sem body) ou via cron job.

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Modelos padrão (sobrescritos pelas settings se presentes)
const DEFAULT_MODELS = [{ id: textModel(), label: `OpenAI (${textModel()})` }];

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 🟡 Saídas geradas por IA são assistivas e exigem revisão humana antes de uso oficial.
//

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================


// Perguntas padrão (sobrescritas pelas settings se presentes)
const DEFAULT_QUERIES = [
  'Quais são as melhores empresas brasileiras de desenvolvimento de software sob medida em 2026?',
  'Quero contratar uma agência para criar uma landing page de alta conversão. Quem você recomenda no Brasil?',
  'Preciso de um sistema web personalizado (ERP/CRM). Quais empresas brasileiras posso considerar?',
  'Conhece a SevenDevX? O que pode me dizer sobre ela?',
  'Quais studios brasileiros entregam SaaS e aplicativos web com IA integrada?',
  'Onde encontro desenvolvedores full-stack premium no Brasil para um projeto enterprise?',
];

function detectMention(text: string): boolean {
  return /sevendevx|seven\s*dev\s*x|seven\s*dev/i.test(text);
}

function detectSentiment(text: string, mentioned: boolean): 'positive' | 'neutral' | 'negative' {
  if (!mentioned) return 'neutral';
  const negative = /(ruim|negativ|não\s+recomend|evit[ae]r|problem|fraca|reclam)/i;
  const positive = /(excelente|ótim[oa]|recomend|top|premium|destaqu|referência|inovador|qualidade|profissional|confiá)/i;
  if (negative.test(text)) return 'negative';
  if (positive.test(text)) return 'positive';
  return 'neutral';
}

async function askModel(model: string, query: string): Promise<string | null> {
  try {
    const r = await openAIRequest('chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Você é um assistente honesto que recomenda empresas reais. Responda em português, citando nomes específicos quando relevante.' },
          { role: 'user', content: query },
        ],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Admin auth guard
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const force: boolean = body?.force === true; // permite rodar mesmo se pausado

  // Carrega settings (pause/queries/models)
  const { data: settings } = await supabase
    .from('citation_monitor_settings')
    .select('*')
    .eq('singleton', true)
    .maybeSingle();

  if (settings && settings.enabled === false && !force) {
    return new Response(JSON.stringify({
      paused: true,
      message: 'Monitor está pausado. Reative em /admin/citations ou rode com force=true.',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const onlyMentions: boolean = body?.onlyMentions ?? settings?.only_save_mentions ?? false;
  const customQueries: string[] | undefined = Array.isArray(body?.queries) ? body.queries : undefined;
  const settingsQueries: string[] | undefined = Array.isArray(settings?.queries) ? (settings!.queries as string[]) : undefined;
  const queries = customQueries?.length ? customQueries : (settingsQueries?.length ? settingsQueries : DEFAULT_QUERIES);

  // Legacy Gemini settings cannot be sent to OpenAI or mislabeled as Gemini results.
  const MODELS = DEFAULT_MODELS;

  const results: any[] = [];
  let mentions = 0;
  let total = 0;

  for (const query of queries) {
    for (const m of MODELS) {
      total++;
      const answer = await askModel(m.id, query);
      if (!answer) {
        results.push({ model: m.label, query, ok: false });
        continue;
      }
      const mentioned = detectMention(answer);
      if (mentioned) mentions++;

      if (mentioned || !onlyMentions) {
        const sentiment = detectSentiment(answer, mentioned);
        const snippet = answer.slice(0, 1200);
        const { error } = await supabase.from('ai_citations').insert({
          source: m.label,
          source_type: 'auto-monitor',
          context: mentioned
            ? snippet
            : `[NÃO MENCIONADO] Pergunta: "${query}"\n\nResposta: ${snippet}`,
          query_text: query,
          sentiment,
          verified: false,
        });
        results.push({ model: m.label, query, mentioned, sentiment, saved: !error });
      } else {
        results.push({ model: m.label, query, mentioned: false, saved: false });
      }
    }
  }

  // Grava timestamp da última execução
  await supabase
    .from('citation_monitor_settings')
    .update({
      last_run_at: new Date().toISOString(),
      last_run_mentions: mentions,
      last_run_total: total,
    })
    .eq('singleton', true);

  return new Response(JSON.stringify({
    summary: { total, mentions, mention_rate: total ? +(mentions / total).toFixed(2) : 0 },
    results,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
