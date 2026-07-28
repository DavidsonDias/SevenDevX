/**
 * ⚡ vercel-info/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/vercel-info/index.ts
 * @module Integrations
 *
 * @description
 * Retorna dados de projetos e deploys da Vercel.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Vercel
 *
 * @remarks
 * O token permanece no ambiente da função.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VERCEL_TOKEN = Deno.env.get("VERCEL_TOKEN") ?? "";

async function vc(path: string) {
  const r = await fetch(`https://api.vercel.com${path}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  if (!r.ok) throw new Error(`Vercel ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "no auth" }), { status: 401, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });

    const { project_id } = await req.json();
    if (!project_id) return new Response(JSON.stringify({ error: "project_id required" }), { status: 400, headers: corsHeaders });

    // project_id can be ID or name
    const project = await vc(`/v9/projects/${encodeURIComponent(project_id)}`);
    const deployments = await vc(`/v6/deployments?projectId=${project.id}&limit=5`);

    return new Response(
      JSON.stringify({
        project: {
          id: project.id,
          name: project.name,
          framework: project.framework,
          updated_at: project.updatedAt,
        },
        deployments: (deployments.deployments ?? []).map((d: any) => ({
          uid: d.uid,
          state: d.state, // READY, BUILDING, ERROR, etc.
          url: `https://${d.url}`,
          target: d.target,
          created: d.created,
          source: d.source,
          meta: { branch: d.meta?.githubCommitRef, msg: d.meta?.githubCommitMessage },
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: corsHeaders });
  }
});
