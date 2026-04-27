// AI Engine — generates briefings, proposals, scopes, summaries via Lovable AI Gateway
// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  client_summary:
    "Você é um analista sênior de CRM da SevenDevX. Receba dados de um cliente e suas interações e produza um resumo estratégico em PT-BR com: perfil do cliente, principais necessidades, oportunidades comerciais e próximas ações sugeridas. Use markdown com seções curtas e bullets.",
  stage_output:
    "Você é um consultor sênior da SevenDevX especializado em produtos digitais. Para a etapa de processo informada, gere um documento profissional em PT-BR usando markdown, pronto para ser enviado ao cliente. Seja específico, prático e estratégico.",
  dashboard_insights:
    "Você é um diretor de operações analisando KPIs da SevenDevX. Receba números do dashboard e retorne 3 insights acionáveis curtos em PT-BR (markdown com bullets), priorizando alertas, oportunidades e próximos passos.",
  faq_suggestions:
    "Você é um especialista em conteúdo. Sugira 5 novas perguntas frequentes em PT-BR para uma agência de produtos digitais, com pergunta + resposta curta. Retorne em markdown numerado.",
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

    const userMsg = typeof context === "string" ? context : JSON.stringify(context, null, 2);

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
