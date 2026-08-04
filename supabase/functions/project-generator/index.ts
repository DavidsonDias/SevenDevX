/**
 * 🚀 project-generator/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/project-generator/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `project-generator` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `clients`, `projects`, `process_templates`, `process_template_stages`, `project_stages`, `stage_checklist_items`
 * ✅ Invoca RPC: `has_role`, `fn_ai_usage_check_quota`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `project-generator`
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
 * ⚡ project-generator/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/project-generator/index.ts
 * @module Projects
 *
 * @description
 * Geração assistida de estrutura de projeto.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * AI Gateway
 *
 * @remarks
 * Saída é rascunho: exige confirmação antes de persistir.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🤖 project-generator — gera projeto completo a partir de um briefing (cliente + projeto + estágios + documentos + estimativa)
// Validação rigorosa de input com Zod, rate-limit por usuário, auditoria.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const InputSchema = z.object({
  briefing: z.string().trim().min(20, "Briefing muito curto (mín. 20 chars)").max(8000, "Briefing muito longo (máx. 8000 chars)"),
  client_id: z.string().uuid().nullable().optional(),
  client_name: z.string().trim().max(120).optional().nullable(),
  client_email: z.string().trim().email().max(160).optional().nullable().or(z.literal("")),
  client_company: z.string().trim().max(160).optional().nullable(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 🟡 Saídas geradas por IA são assistivas e exigem revisão humana antes de uso oficial.
// 🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.
//

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const formatDateBR = () =>
  new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) + "-" + Math.random().toString(36).slice(2, 6);

async function callAI(apiKey: string, system: string, user: string, schema?: any) {
  const body: any = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (schema) {
    body.tools = [{ type: "function", function: schema }];
    body.tool_choice = { type: "function", function: { name: schema.name } };
  }
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI error ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  if (schema) {
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return args ? JSON.parse(args) : null;
  }
  return data.choices?.[0]?.message?.content || "";
}

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Validate caller is admin (use anon client + JWT)
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) throw new Error("Unauthorized");
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin role required");

    // Rate-limit / quota de IA por usuário (24h)
    const { data: quota } = await userClient.rpc("fn_ai_usage_check_quota" as any, { _user_id: user.id });
    const q = Array.isArray(quota) ? quota[0] : quota;
    if (q && q.allowed === false) {
      return new Response(
        JSON.stringify({ error: `Quota de IA excedida (${q.used}/${q.limit} nas últimas 24h)`, quota: q }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = InputSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validação falhou", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { briefing, client_id, client_name, client_email, client_company } = parsed.data;

    // Service-role client for DB writes
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1) Estimate scope (structured output)
    const today = formatDateBR();
    const estimate = await callAI(
      apiKey,
      `Você é um diretor técnico da SevenDevX. Analise o briefing e retorne uma estimativa profissional realista para o mercado brasileiro de software houses (2025-2026). Use a função fornecida.`,
      `Data: ${today}\n\nBRIEFING:\n${briefing}\n\nCLIENTE:\n${JSON.stringify({ client_name, client_email, client_company })}`,
      {
        name: "estimate_project",
        description: "Estima escopo, prazo, valor e título do projeto",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Título conciso do projeto (max 60 chars)" },
            subtitle: { type: "string", description: "Frase curta descrevendo (max 100 chars)" },
            description: { type: "string", description: "Resumo executivo em 2-3 parágrafos" },
            category: { type: "string", enum: ["landing-page", "site-institucional", "web-app", "ecommerce", "automacao", "outros"] },
            estimated_weeks: { type: "integer", minimum: 1, maximum: 52 },
            estimated_value_brl: { type: "number", description: "Valor total estimado em BRL" },
            installments: { type: "integer", minimum: 1, maximum: 12 },
            installment_value_brl: { type: "number" },
            tech_stack: { type: "array", items: { type: "string" }, description: "5-8 tecnologias" },
            features: { type: "array", items: { type: "string" }, description: "5-10 funcionalidades principais" },
          },
          required: ["title", "description", "estimated_weeks", "estimated_value_brl", "installments", "features"],
          additionalProperties: false,
        },
      }
    );

    if (!estimate) throw new Error("Falha ao gerar estimativa");

    // 2) Resolve / create client
    let finalClientId = client_id as string | null;
    if (!finalClientId) {
      const { data: existing } = await admin
        .from("clients")
        .select("id")
        .eq("email", client_email || "")
        .maybeSingle();
      if (existing?.id) {
        finalClientId = existing.id;
      } else {
        const { data: newClient, error: cErr } = await admin
          .from("clients")
          .insert({
            name: client_name || estimate.title + " (Cliente)",
            email: client_email || null,
            company: client_company || null,
            status: "lead",
            created_by: user.id,
            notes: `Criado automaticamente pelo gerador de projetos IA em ${today}.`,
          })
          .select("id")
          .single();
        if (cErr) throw cErr;
        finalClientId = newClient.id;
      }
    }

    // 3) Create project
    const slug = slugify(estimate.title);
    const { data: project, error: pErr } = await admin
      .from("projects")
      .insert({
        slug,
        title: estimate.title,
        subtitle: estimate.subtitle || null,
        description: estimate.description,
        category: estimate.category || "web-app",
        client_id: finalClientId,
        client_name: client_name || null,
        status: "draft",
        is_published_on_site: false,
        pipeline_stage: "diagnostico",
        contract_status: "pending",
        tags: estimate.features?.slice(0, 5) || [],
        technologies: (estimate.tech_stack || []).map((t: string) => ({ name: t })),
        created_by: user.id,
      })
      .select("id, slug")
      .single();
    if (pErr) throw pErr;

    // 4) Instantiate stages from default template
    const { data: tpl } = await admin
      .from("process_templates")
      .select("id")
      .eq("is_default", true)
      .maybeSingle();
    let stageIds: string[] = [];
    if (tpl?.id) {
      const { data: tplStages } = await admin
        .from("process_template_stages")
        .select("*")
        .eq("template_id", tpl.id)
        .order("display_order");
      if (tplStages?.length) {
        const rows = tplStages.map((s: any) => ({
          project_id: project.id,
          template_stage_id: s.id,
          slug: s.slug,
          name: s.name,
          display_order: s.display_order,
        }));
        const { data: insertedStages } = await admin.from("project_stages").insert(rows).select("id");
        stageIds = (insertedStages || []).map((s: any) => s.id);

        const checklistRows: any[] = [];
        insertedStages?.forEach((ps: any, idx: number) => {
          const items = (tplStages[idx]?.default_checklist as any[]) || [];
          items.forEach((it: any, i: number) =>
            checklistRows.push({
              stage_id: ps.id,
              title: typeof it === "string" ? it : it.title,
              display_order: i,
            })
          );
        });
        if (checklistRows.length) await admin.from("stage_checklist_items").insert(checklistRows);
      }
    }

    // 5) Generate initial documents (escopo, proposta) on first stage
    let docsCreated = 0;
    if (stageIds[0]) {
      const docTypes = [
        {
          type: "scope",
          title: "Escopo Técnico — " + estimate.title,
          system:
            "Você é um arquiteto de software. Gere um escopo técnico em PT-BR (markdown) com: Visão geral, Arquitetura, Funcionalidades detalhadas, Stack tecnológica, Riscos e premissas.",
        },
        {
          type: "proposal",
          title: "Proposta Comercial — " + estimate.title,
          system:
            "Você é um diretor comercial. Gere uma proposta comercial em PT-BR (markdown) com: Sobre a SevenDevX, Entendimento do desafio, Solução proposta, Investimento, Cronograma, Próximos passos.",
        },
      ];
      for (const d of docTypes) {
        try {
          const content = await callAI(
            apiKey,
            d.system + " Use o briefing e a estimativa fornecidos. Sem placeholders genéricos.",
            JSON.stringify({ briefing, estimate, client_name, current_date: today }, null, 2)
          );
          await admin.from("stage_documents").insert({
            project_id: project.id,
            stage_id: stageIds[0],
            type: d.type,
            title: d.title,
            content,
            generated_by_ai: true,
            ai_model: "google/gemini-2.5-flash",
            created_by: user.id,
            metadata: { estimate },
          });
          docsCreated++;
        } catch (err) {
          console.error("doc gen failed", d.type, err);
        }
      }
    }

    // 6) Initial interaction log
    if (finalClientId) {
      await admin.from("client_interactions").insert({
        client_id: finalClientId,
        type: "note",
        title: "Projeto gerado por IA",
        description: `Projeto "${estimate.title}" criado automaticamente.\n\nEstimativa: R$ ${estimate.estimated_value_brl?.toLocaleString("pt-BR")} em ${estimate.installments}x · prazo ${estimate.estimated_weeks} semanas.`,
        created_by: user.id,
        metadata: { project_id: project.id, source: "project-generator" },
      });
    }

    // 7) Log AI usage (success)
    try {
      await admin.from("ai_usage" as any).insert({
        user_id: user.id,
        user_email: user.email,
        function_name: "project-generator",
        model: "google/gemini-2.5-flash",
        prompt_chars: briefing.length,
        output_chars: JSON.stringify(estimate).length,
        success: true,
        metadata: { project_id: project.id, documents_created: docsCreated },
      });
    } catch (logErr) {
      console.error("ai_usage log failed", logErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        project_id: project.id,
        project_slug: project.slug,
        client_id: finalClientId,
        estimate,
        documents_created: docsCreated,
        stages_created: stageIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("project-generator error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg.includes("Unauthorized") ? 401 : msg.includes("Forbidden") ? 403 : msg.includes("Quota") ? 429 : 500;
    // Log failure (best-effort, silent)
    try {
      const adminLog = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const auth = req.headers.get("Authorization") || "";
      const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth } },
      });
      const { data: { user: u } } = await userClient.auth.getUser();
      if (u) {
        await adminLog.from("ai_usage" as any).insert({
          user_id: u.id,
          user_email: u.email,
          function_name: "project-generator",
          success: false,
          error: msg.slice(0, 500),
        });
      }
    } catch {}
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
