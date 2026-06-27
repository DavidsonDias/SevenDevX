// Brand scan — fetches a URL and returns favicons, og:image, theme-color, name. Admin only.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function abs(base: string, href: string) {
  try { return new URL(href, base).href; } catch { return href; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: isAdmin } = await uc.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { url } = await req.json();
    if (!url || typeof url !== "string") return new Response(JSON.stringify({ error: "missing_url" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;

    const res = await fetch(target, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 SevenOS BrandScan" } });
    if (!res.ok) return new Response(JSON.stringify({ error: `fetch_${res.status}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const finalUrl = res.url || target;
    const html = await res.text();

    const head = html.slice(0, 60000);

    const pickAttr = (re: RegExp) => {
      const m = head.match(re);
      return m ? m[1].trim() : null;
    };

    const title = pickAttr(/<title[^>]*>([^<]+)<\/title>/i);
    const name = pickAttr(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
      || pickAttr(/<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["']/i)
      || title;
    const description = pickAttr(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || pickAttr(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const themeColor = pickAttr(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i);
    const ogImage = pickAttr(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const twitterImage = pickAttr(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    const icons: { href: string; sizes?: string; rel: string }[] = [];
    const iconRe = /<link[^>]+rel=["']([^"']*icon[^"']*)["'][^>]*>/gi;
    let im: RegExpExecArray | null;
    while ((im = iconRe.exec(head)) !== null) {
      const tag = im[0];
      const href = (tag.match(/href=["']([^"']+)["']/) || [])[1];
      const sizes = (tag.match(/sizes=["']([^"']+)["']/) || [])[1];
      if (href) icons.push({ rel: im[1], href: abs(finalUrl, href), sizes });
    }
    // Fallback /favicon.ico
    if (!icons.length) icons.push({ rel: "icon", href: abs(finalUrl, "/favicon.ico") });

    return new Response(JSON.stringify({
      ok: true,
      url: finalUrl,
      name,
      title,
      description,
      themeColor,
      ogImage: ogImage ? abs(finalUrl, ogImage) : null,
      twitterImage: twitterImage ? abs(finalUrl, twitterImage) : null,
      icons,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
