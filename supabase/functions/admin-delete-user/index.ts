/**
 * 🚀 admin-delete-user/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/admin-delete-user/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `admin-delete-user` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `user_roles`, `admin_sessions`, `audit_log`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `admin-delete-user`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
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
 * 🗑️ admin-delete-user — Exclusão real de usuários via service-role.
 * Valida JWT, exige role admin, protege Davidson/SevenDevX e o último admin.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const PROTECTED_EMAILS = ["davidson", "sevendevx"];

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const isProtected = (email?: string | null) =>
  !!email && PROTECTED_EMAILS.some((p) => email.toLowerCase().includes(p));

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing bearer token" }, 401);
    }

    // 1) Verifica usuário chamador
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: meData, error: meErr } = await userClient.auth.getUser();
    if (meErr || !meData.user) return json({ error: "unauthorized" }, 401);

    // 2) Confirma role admin
    const { data: roles } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", meData.user.id);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "super_admin");
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    // 3) Lê payload
    const { user_id } = (await req.json().catch(() => ({}))) as { user_id?: string };
    if (!user_id) return json({ error: "user_id required" }, 400);
    if (user_id === meData.user.id) return json({ error: "cannot_delete_self" }, 400);

    // 4) Service-role: checa proteções e executa
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: target, error: tErr } = await admin.auth.admin.getUserById(user_id);
    if (tErr || !target.user) return json({ error: "user_not_found" }, 404);
    if (isProtected(target.user.email)) return json({ error: "protected_user" }, 403);

    // Último admin?
    const { data: targetRoles } = await admin
      .from("user_roles").select("role").eq("user_id", user_id);
    const targetIsAdmin = (targetRoles ?? []).some((r: any) => r.role === "admin" || r.role === "super_admin");
    if (targetIsAdmin) {
      const { count } = await admin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .in("role", ["admin", "super_admin"] as any);
      if ((count ?? 0) <= 1) return json({ error: "cannot_remove_last_admin" }, 400);
    }

    // 5) Limpeza coordenada (profiles/roles em cascata pelo auth.users? user_roles tem FK on delete cascade)
    await admin.from("admin_sessions").update({ revoked_at: new Date().toISOString() }).eq("user_id", user_id);
    await admin.from("audit_log").insert({
      actor_id: meData.user.id,
      actor_email: meData.user.email,
      table_name: "auth.users",
      record_id: user_id,
      action: "DELETE",
      summary: `admin removeu usuário ${target.user.email}`,
      diff: { deleted_email: target.user.email },
    });

    const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
    if (delErr) return json({ error: delErr.message }, 500);

    return json({ ok: true, deleted_email: target.user.email });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
