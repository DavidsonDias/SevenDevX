// Citation Monitor — Edge Function
// Pergunta para o Lovable AI Gateway (vários modelos) sobre a SevenDevX
// e registra automaticamente em `ai_citations` se foi mencionada.
//
// Pode ser chamada manualmente (POST sem body) ou via cron job.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Modelos padrão (sobrescritos pelas settings se presentes)
const DEFAULT_MODELS: { id: string; label: string }[] = [
  { id: 'google/gemini-2.5-flash', label: 'Gemini' },
  { id: 'openai/gpt-5-mini', label: 'ChatGPT' },
];

function modelLabel(id: string): string {
  if (id.startsWith('google/gemini')) return id.includes('pro') ? 'Gemini Pro' : 'Gemini';
  if (id.startsWith('openai/gpt')) return id.includes('5-mini') ? 'ChatGPT' : 'ChatGPT (GPT-5)';
  return id;
}

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
    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: any = {};
  try { body = await req.json(); } catch {}
  const onlyMentions: boolean = body?.onlyMentions ?? false;
  const customQueries: string[] | undefined = Array.isArray(body?.queries) ? body.queries : undefined;
  const queries = customQueries?.length ? customQueries : QUERIES;

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

  return new Response(JSON.stringify({
    summary: { total, mentions, mention_rate: total ? +(mentions / total).toFixed(2) : 0 },
    results,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
