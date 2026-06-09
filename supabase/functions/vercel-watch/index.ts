// Vercel watch cron — protected by service role key OR CRON_SECRET shared header.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VERCEL_TOKEN = Deno.env.get("VERCEL_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

async function vc(path: string) {
  const r = await fetch(`https://api.vercel.com${path}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  if (!r.ok) throw new Error(`Vercel ${path}: ${r.status}`);
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // ✅ Restrict to internal scheduler: must present service role key or CRON_SECRET
  const auth = req.headers.get("Authorization") || "";
  const provided = auth.replace(/^Bearer\s+/i, "");
  const okAuth =
    (CRON_SECRET && provided === CRON_SECRET) ||
    (SERVICE_KEY && provided === SERVICE_KEY);
  if (!okAuth) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: projects } = await admin
      .from("projects")
      .select("id, title, vercel_project_id")
      .not("vercel_project_id", "is", null);

    let checked = 0, alerted = 0;

    for (const p of projects ?? []) {
      checked++;
      try {
        const proj = await vc(`/v9/projects/${encodeURIComponent(p.vercel_project_id)}`);
        const deps = await vc(`/v6/deployments?projectId=${proj.id}&limit=3`);
        const errored = (deps.deployments ?? []).find((d: any) => d.state === "ERROR");
        if (!errored) continue;

        const { data: existing } = await admin
          .from("vercel_deploy_alerts")
          .select("id")
          .eq("project_id", p.id)
          .eq("deployment_uid", errored.uid)
          .maybeSingle();
        if (existing) continue;

        await admin.from("vercel_deploy_alerts").insert({
          project_id: p.id,
          deployment_uid: errored.uid,
          state: errored.state,
        });

        await fetch(`${SUPABASE_URL}/functions/v1/push-send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({
            title: `🚨 Deploy ERROR: ${p.title}`,
            body: `${errored.meta?.githubCommitMessage ?? errored.url} (${errored.meta?.githubCommitRef ?? "main"})`,
            url: `/admin/projects/${p.id}`,
          }),
        });
        alerted++;
      } catch (e) {
        console.error("vercel-watch project failed", p.id, e);
      }
    }

    return new Response(JSON.stringify({ checked, alerted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
