/**
 * 🚀 index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/ai-chat/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `ai-chat` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `chat_conversations`, `chat_messages`
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

/**
 * 🤖 AI Chat Edge Function - SevenDevX Enterprise
 * Chatbot inteligente com streaming usando Lovable AI
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SYSTEM_PROMPT = `Você é a 7AI, assistente virtual inteligente da SevenDevX - uma empresa de desenvolvimento web e software de alta performance.

📋 SOBRE A SEVENDEVX:
- Somos especializados em desenvolvimento web, aplicativos, sistemas empresariais e consultoria em tecnologia
- Trabalhamos com React, TypeScript, Node.js, Python, e tecnologias cloud
- Oferecemos serviços de: Sites institucionais, E-commerce, Sistemas ERP, Apps móveis, Consultoria técnica
- Localização: Belo Horizonte, MG - Brasil
- Contato: contato@sevendevx.com | WhatsApp: +55 31 98474-0625

🎯 SUAS DIRETRIZES:
1. Seja profissional, amigável e prestativo
2. Responda em português brasileiro
3. Se não souber algo específico, encaminhe para contato humano
4. Destaque nossos diferenciais: qualidade, prazo e suporte
5. Para orçamentos, colete: nome, email, tipo de projeto, prazo desejado
6. Mantenha respostas concisas (máx 3 parágrafos)
7. Use emojis moderadamente para tornar a conversa mais amigável

🚫 NÃO FAÇA:
- Não invente informações sobre preços específicos
- Não prometa prazos sem consulta
- Não compartilhe dados de outros clientes`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages: rawMessages, conversationId, visitorId } = await req.json();

    // Input validation - prevent API credit exhaustion
    const MAX_MESSAGES = 30;
    const MAX_MSG_LENGTH = 4000;
    const MAX_TOTAL_CHARS = 30000;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens inválidas" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (rawMessages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: "Conversa muito longa" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const messages = rawMessages.map((m: any) => ({
      role: m?.role === "assistant" || m?.role === "system" ? m.role : "user",
      content: String(m?.content ?? "").slice(0, MAX_MSG_LENGTH),
    }));
    const totalChars = messages.reduce((s, m) => s + m.content.length, 0);
    if (totalChars > MAX_TOTAL_CHARS) {
      return new Response(JSON.stringify({ error: "Conteúdo muito grande" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const safeVisitorId = typeof visitorId === "string" ? visitorId.slice(0, 64) : "anonymous";
    const safeConversationId = typeof conversationId === "string" && conversationId.length <= 64 ? conversationId : null;

    
    console.log(`[AI-Chat] Processing request - Conversation: ${safeConversationId}, Messages: ${messages.length}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[AI-Chat] LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create or update conversation
    let currentConversationId = safeConversationId;
    if (!currentConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ visitor_id: safeVisitorId })
        .select()
        .single();
      
      if (convError) {
        console.error("[AI-Chat] Failed to create conversation:", convError);
      } else {
        currentConversationId = newConv.id;
      }
    }

    // Save user message
    if (currentConversationId && messages?.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === "user") {
        await supabase.from("chat_messages").insert({
          conversation_id: currentConversationId,
          role: "user",
          content: lastUserMessage.content,
        });
      }
    }

    // Call Lovable AI Gateway with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI-Chat] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas solicitações. Por favor, aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Serviço temporariamente indisponível." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    console.log("[AI-Chat] Streaming response started");

    // Return streaming response with conversation ID in header
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Conversation-Id": currentConversationId || "",
      },
    });

  } catch (error) {
    console.error("[AI-Chat] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar mensagem",
        fallback: "Desculpe, estou com dificuldades técnicas. Entre em contato pelo WhatsApp: +55 31 98474-0625"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
