// AI Engine — generates briefings, proposals, scopes, summaries, contracts via Lovable AI Gateway
// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  client_summary:
    "Você é um analista sênior de CRM da SevenDevX. Receba dados de um cliente e suas interações e produza um resumo estratégico em PT-BR com: perfil do cliente, principais necessidades, oportunidades comerciais e próximas ações sugeridas. Use markdown com seções curtas e bullets. IMPORTANTE: a data atual será fornecida no contexto — use sempre essa data como referência temporal, NUNCA invente datas de outros anos.",
  stage_output:
    "Você é um consultor sênior da SevenDevX especializado em produtos digitais. Receba o JSON com 'instruction' (o que gerar), 'project', 'client', 'stage', 'recent_interactions' e 'current_date'. Gere o documento solicitado em PT-BR usando markdown profissional, pronto para enviar ao cliente. Seja específico, prático, estratégico, sem placeholders genéricos. Use o contexto real fornecido. Estruture com cabeçalhos, listas e seções claras. IMPORTANTE: SEMPRE use o valor de 'current_date' como data de referência. NUNCA escreva datas de 2024 ou anos anteriores se a data atual for outra.",
  dashboard_insights:
    "Você é um diretor de operações analisando KPIs da SevenDevX. Receba números do dashboard e retorne 3 insights acionáveis curtos em PT-BR (markdown com bullets), priorizando alertas, oportunidades e próximos passos.",
  faq_suggestions:
    "Você é um especialista em conteúdo. Sugira 5 novas perguntas frequentes em PT-BR para uma agência de produtos digitais, com pergunta + resposta curta. Retorne em markdown numerado.",
  contract_generate:
    `Você é um advogado especializado em contratos de prestação de serviços digitais para a SevenDevX (agência de desenvolvimento de software, landing pages e produtos digitais).

Gere um CONTRATO PROFISSIONAL DE PRESTAÇÃO DE SERVIÇOS em PT-BR, pronto para assinatura, em markdown bem formatado.

ESTRUTURA OBRIGATÓRIA (use exatamente estes cabeçalhos):
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS DIGITAIS

**CONTRATANTE:** {dados do cliente fornecidos no contexto}
**CONTRATADA:** SevenDevX — Desenvolvimento de Software e Produtos Digitais
**DATA:** {use SEMPRE o valor de current_date do contexto, formatado em português, ex: "29 de abril de 2026"}

## CLÁUSULA 1ª — DO OBJETO
Descreva os serviços contratados com base no contexto.

## CLÁUSULA 2ª — DAS OBRIGAÇÕES DA CONTRATADA
Liste 4 a 6 obrigações claras.

## CLÁUSULA 3ª — DAS OBRIGAÇÕES DO CONTRATANTE
Liste 3 a 5 obrigações.

## CLÁUSULA 4ª — DO PRAZO E ENTREGA
Use o prazo do contexto (ou indique "a definir em cronograma anexo").

## CLÁUSULA 5ª — DO VALOR E FORMA DE PAGAMENTO
Use o valor do contexto (ou descreva condições padrão de mercado).

## CLÁUSULA 6ª — DA RESCISÃO
Cláusula clara de rescisão por qualquer das partes com aviso prévio de 15 dias.

## CLÁUSULA 7ª — DA CONFIDENCIALIDADE
Cláusula de NDA mútua.

## CLÁUSULA 8ª — DA PROPRIEDADE INTELECTUAL
Defina quando os direitos são transferidos ao Contratante (após pagamento integral).

## CLÁUSULA 9ª — DO FORO
Foro da Comarca de São Paulo/SP, salvo se o contexto indicar outra cidade.

## ASSINATURAS
___________________________
{Nome do Contratante}

___________________________
SevenDevX

REGRAS CRÍTICAS:
- NUNCA invente data: use SEMPRE current_date do contexto.
- Linguagem formal jurídica brasileira.
- Sem comentários, sem markdown extra além do contrato.
- Pronto para imprimir/exportar PDF.`,
};

const formatDateBR = () => {
  const d = new Date();
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { task, context, model } = await req.json();
    const system = SYSTEM_PROMPTS[task];
    if (!system) {
      return new Response(JSON.stringify({ error: "Unknown task" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inject current date into every context object so the AI never invents dates
    const enrichedContext =
      typeof context === "string"
        ? { instruction: context, current_date: formatDateBR(), current_iso: new Date().toISOString() }
        : { ...(context || {}), current_date: formatDateBR(), current_iso: new Date().toISOString() };

    const userMsg = JSON.stringify(enrichedContext, null, 2);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Limite de requisições atingido. Aguarde um minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-engine error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
