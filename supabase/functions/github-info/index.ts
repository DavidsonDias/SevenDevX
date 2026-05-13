import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GH_TOKEN = Deno.env.get("GITHUB_TOKEN") ?? "";

async function gh(path: string) {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "SevenDevX-OS",
    },
  });
  if (!r.ok) throw new Error(`GitHub ${path}: ${r.status} ${await r.text()}`);
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

    const { repo } = await req.json();
    if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      return new Response(JSON.stringify({ error: "invalid repo (use owner/name)" }), { status: 400, headers: corsHeaders });
    }

    const [info, commits, prs] = await Promise.all([
      gh(`/repos/${repo}`),
      gh(`/repos/${repo}/commits?per_page=5`),
      gh(`/repos/${repo}/pulls?state=open&per_page=5`),
    ]);

    return new Response(
      JSON.stringify({
        repo: {
          full_name: info.full_name,
          description: info.description,
          stars: info.stargazers_count,
          default_branch: info.default_branch,
          html_url: info.html_url,
          updated_at: info.updated_at,
          private: info.private,
        },
        commits: commits.map((c: any) => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split("\n")[0],
          author: c.commit.author?.name,
          date: c.commit.author?.date,
          url: c.html_url,
        })),
        pulls: prs.map((p: any) => ({
          number: p.number,
          title: p.title,
          user: p.user?.login,
          url: p.html_url,
          updated_at: p.updated_at,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: corsHeaders });
  }
});
