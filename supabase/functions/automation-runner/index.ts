// 🤖 Automation Runner — executa automações ativas para um trigger_event.
// Chamado pelo trigger SQL fn_dispatch_automation OU manualmente via /test-trigger.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function evalCondition(c: any, payload: any): boolean {
  const v = getPath(payload, c.field);
  const target = c.value;
  switch (c.op) {
    case "equals": return String(v) === String(target);
    case "not_equals": return String(v) !== String(target);
    case "contains": return String(v ?? "").includes(String(target));
    case "gt": return Number(v) > Number(target);
    case "lt": return Number(v) < Number(target);
    case "exists": return v !== undefined && v !== null;
    case "regex": try { return new RegExp(String(target)).test(String(v ?? "")); } catch { return false; }
    default: return true;
  }
}

function interpolate(str: string, payload: any): string {
  if (typeof str !== "string") return str;
  return str.replace(/\{\{([^}]+)\}\}/g, (_, k) => String(getPath(payload, k.trim()) ?? ""));
}

function interpolateParams(params: any, payload: any): any {
  if (typeof params === "string") return interpolate(params, payload);
  if (Array.isArray(params)) return params.map((p) => interpolateParams(p, payload));
  if (params && typeof params === "object") {
    const out: any = {};
    for (const k of Object.keys(params)) out[k] = interpolateParams(params[k], payload);
    return out;
  }
  return params;
}

async function runAction(act: any, payload: any, sb: any): Promise<any> {
  const params = interpolateParams(act.params ?? {}, payload);
  switch (act.type) {
    case "delay": {
      await new Promise((r) => setTimeout(r, Math.min(10000, (params.seconds ?? 1) * 1000)));
      return { ok: true };
    }
    case "webhook.call":
    case "http.request": {
      if (!params.url) throw new Error("url required");
      const res = await fetch(params.url, {
        method: params.method ?? "POST",
        headers: { "Content-Type": "application/json", ...(params.headers ?? {}) },
        body: params.body ? (typeof params.body === "string" ? params.body : JSON.stringify(params.body)) : JSON.stringify(payload),
      });
      return { ok: res.ok, status: res.status };
    }
    case "slack.notify":
    case "discord.notify": {
      const url = params.webhook ?? params.url;
      if (!url) throw new Error("webhook url required");
      const body = act.type === "slack.notify"
        ? { text: params.text ?? "", channel: params.channel }
        : { content: params.text ?? "" };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return { ok: res.ok, status: res.status };
    }
    case "push.send": {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/push-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ title: params.title, body: params.body, url: params.url }),
      });
      return { ok: res.ok };
    }
    case "ai.summarize": {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
      const prompt = `${params.prompt ?? "Resuma:"}\n\n${JSON.stringify(payload)}`;
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
        body: JSON.stringify({ model: params.model ?? "google/gemini-2.5-flash", messages: [{ role: "user", content: prompt }] }),
      });
      const j = await res.json();
      return { ok: res.ok, content: j.choices?.[0]?.message?.content };
    }
    case "db.update": {
      if (!params.table) throw new Error("table required");
      const q = sb.from(params.table).update(params.set ?? {});
      for (const [k, v] of Object.entries(params.where ?? {})) q.eq(k, v as any);
      const { error } = await q;
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    case "pipeline.move": {
      const pid = payload?.project_id ?? payload?.record?.id;
      if (!pid || !params.stage) throw new Error("project_id and stage required");
      const { error } = await sb.from("projects").update({ pipeline_stage: params.stage }).eq("id", pid);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    case "email.send":
    case "whatsapp.send":
    case "transform":
    case "code.run":
    case "loop":
    case "retry":
      return { ok: true, simulated: true };
    default:
      return { ok: true, unknown: act.type };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Auth: require internal service secret OR admin JWT
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    let authorized = false;
    if (token && token === SERVICE_KEY) {
      authorized = true;
    } else if (token) {
      const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData } = await userClient.auth.getUser(token);
      if (userData?.user) {
        const admin = createClient(SUPABASE_URL, SERVICE_KEY);
        const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
        if (roles) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { trigger_event, payload = {}, event_id, automation_id } = await req.json();

    const query = sb.from("automations").select("*").eq("is_active", true);
    const { data: automations, error } = automation_id
      ? await query.eq("id", automation_id)
      : await query.eq("trigger_event", trigger_event);
    if (error) throw error;

    const results: any[] = [];
    for (const auto of automations ?? []) {
      const conds = (auto.conditions as any[]) ?? [];
      const passes = conds.every((c) => evalCondition(c, payload));
      if (!passes) {
        results.push({ automation_id: auto.id, skipped: "conditions_failed" });
        continue;
      }
      const t0 = Date.now();
      const steps: any[] = [];
      let status: "success" | "failed" = "success";
      let err: string | null = null;
      for (const act of ((auto.actions as any[]) ?? [])) {
        const st = Date.now();
        try {
          const r = await runAction(act, payload, sb);
          steps.push({ type: act.type, ok: true, duration_ms: Date.now() - st, result: r });
        } catch (e: any) {
          status = "failed"; err = e?.message ?? "step_failed";
          steps.push({ type: act.type, ok: false, error: err, duration_ms: Date.now() - st });
          break;
        }
      }
      await sb.from("automation_runs").insert({
        automation_id: auto.id, status, duration_ms: Date.now() - t0, error: err,
        result: { steps }, trigger_payload: payload, trigger_event, event_id,
      });
      await sb.from("automations").update({
        last_run_at: new Date().toISOString(),
        run_count: (auto.run_count ?? 0) + 1,
      }).eq("id", auto.id);
      results.push({ automation_id: auto.id, status, duration_ms: Date.now() - t0 });
    }

    return new Response(JSON.stringify({ executed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: corsHeaders });
  }
});
