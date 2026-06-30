// 🎨 Brand Scan v2 — extração profunda de identidade visual
// Headers/meta + manifest.json + CSS variables + top colors de stylesheets + AI summary.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 SevenOS-BrandScan/2.0";

function abs(base: string, href: string) {
  try { return new URL(href, base).href; } catch { return href; }
}

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function normalizeHex(c: string): string | null {
  c = c.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(c)) {
    return "#" + c.slice(1).split("").map(ch => ch + ch).join("");
  }
  if (/^#[0-9a-f]{6}$/.test(c)) return c;
  if (/^#[0-9a-f]{8}$/.test(c)) return c.slice(0, 7);
  const m = c.match(/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/);
  if (m) {
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    if ([r, g, b].some(n => n > 255)) return null;
    return "#" + [r, g, b].map(n => n.toString(16).padStart(2, "0")).join("");
  }
  return null;
}

function brightness(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/** Extrai todas as cores de um bloco CSS e devolve top N por frequência, excluindo cinzas/brancos puros. */
function topColorsFromCss(css: string, n = 8): string[] {
  const counts = new Map<string, number>();
  const re = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const hex = normalizeHex(m[0]);
    if (!hex) continue;
    // skip pure white/black/transparent neutrals
    const b = brightness(hex);
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), bl = parseInt(hex.slice(5, 7), 16);
    const isGray = Math.abs(r - g) < 8 && Math.abs(g - bl) < 8 && Math.abs(r - bl) < 8;
    if (isGray && (b < 25 || b > 235)) continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([c]) => c);
}

/** :root { --x: #aabbcc } → { "--x": "#aabbcc" } */
function extractCssVariables(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /--([\w-]+)\s*:\s*([^;}\n]+)[;}]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const v = m[2].trim();
    if (/#|rgb|hsl/i.test(v)) out["--" + m[1]] = v;
  }
  return out;
}

async function fetchText(url: string, timeoutMs = 6000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html,text/css,application/json,*/*" }, redirect: "follow", signal: ctrl.signal });
    clearTimeout(id);
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

async function aiBrandSummary(payload: any): Promise<{ summary?: string; suggestedPalette?: string[] } | null> {
  if (!LOVABLE_API_KEY) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{
          role: "user",
          content: `Analise esta identidade de marca e retorne JSON {summary, suggestedPalette:[6 hex]} sem markdown. Dados:\n${JSON.stringify({
            name: payload.name, description: payload.description, themeColor: payload.themeColor,
            cssVariables: payload.cssVariables, topCssColors: payload.topCssColors, manifest: payload.manifest,
          }).slice(0, 3500)}`,
        }],
      }),
    });
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    return JSON.parse(m[0]);
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return jsonRes({ error: "unauthorized" }, 401);
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return jsonRes({ error: "unauthorized" }, 401);
    const { data: isAdmin } = await uc.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return jsonRes({ error: "forbidden" }, 403);

    const { url } = await req.json();
    if (!url || typeof url !== "string") return jsonRes({ error: "missing_url" }, 400);

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;

    const res = await fetch(target, { redirect: "follow", headers: { "User-Agent": UA } });
    if (!res.ok) return jsonRes({ error: `fetch_${res.status}` }, 502);
    const finalUrl = res.url || target;
    const html = await res.text();
    const head = html.slice(0, 120000);

    const pick = (re: RegExp) => { const m = head.match(re); return m ? m[1].trim() : null; };

    const title = pick(/<title[^>]*>([^<]+)<\/title>/i);
    const name = pick(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
      || pick(/<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["']/i) || title;
    const description = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const themeColorRaw = pick(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i);
    const themeColor = themeColorRaw ? normalizeHex(themeColorRaw) ?? themeColorRaw : null;
    const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const twitterImage = pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    const manifestHref = pick(/<link[^>]+rel=["']manifest["'][^>]+href=["']([^"']+)["']/i);

    // Icons
    const icons: { href: string; sizes?: string; rel: string }[] = [];
    const iconRe = /<link[^>]+rel=["']([^"']*icon[^"']*)["'][^>]*>/gi;
    let im: RegExpExecArray | null;
    while ((im = iconRe.exec(head)) !== null) {
      const tag = im[0];
      const href = (tag.match(/href=["']([^"']+)["']/) || [])[1];
      const sizes = (tag.match(/sizes=["']([^"']+)["']/) || [])[1];
      if (href) icons.push({ rel: im[1], href: abs(finalUrl, href), sizes });
    }
    if (!icons.length) icons.push({ rel: "icon", href: abs(finalUrl, "/favicon.ico") });

    // Apple touch icons / OG large
    const appleIcons: string[] = [];
    const appleRe = /<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/gi;
    while ((im = appleRe.exec(head)) !== null) appleIcons.push(abs(finalUrl, im[1]));

    // Stylesheets — top 3 externos + inline <style>
    const styleSheets: string[] = [];
    const cssLinkRe = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
    while ((im = cssLinkRe.exec(head)) !== null) styleSheets.push(abs(finalUrl, im[1]));
    const cssBundle: string[] = [];
    const inlineRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    while ((im = inlineRe.exec(html)) !== null) cssBundle.push(im[1]);
    const externalCss = await Promise.all(styleSheets.slice(0, 4).map(u => fetchText(u, 5000)));
    externalCss.forEach(c => c && cssBundle.push(c));
    const cssMerged = cssBundle.join("\n").slice(0, 400000);
    const topCssColors = topColorsFromCss(cssMerged, 12);
    const cssVariables = extractCssVariables(cssMerged);

    // Manifest
    let manifest: any = null;
    if (manifestHref) {
      const mtxt = await fetchText(abs(finalUrl, manifestHref), 4000);
      if (mtxt) { try { manifest = JSON.parse(mtxt); } catch { /* ignore */ } }
    }
    if (manifest?.icons?.length) {
      manifest.icons.forEach((ic: any) => {
        if (ic.src) icons.push({ rel: "manifest", href: abs(finalUrl, ic.src), sizes: ic.sizes });
      });
    }

    // Fonts
    const fonts = new Set<string>();
    const fontFamilyRe = /font-family\s*:\s*([^;}]+)/gi;
    let fm: RegExpExecArray | null;
    while ((fm = fontFamilyRe.exec(cssMerged)) !== null && fonts.size < 12) {
      fm[1].split(",").forEach(f => {
        const name = f.replace(/["']/g, "").trim();
        if (name && !/^(inherit|initial|unset|sans|serif|mono|system-ui|-apple-system)/i.test(name)) {
          fonts.add(name);
        }
      });
    }

    // AI summary (best effort)
    const ai = await aiBrandSummary({
      name, description, themeColor, cssVariables, topCssColors,
      manifest: manifest ? { theme_color: manifest.theme_color, background_color: manifest.background_color, name: manifest.name } : null,
    });

    return jsonRes({
      ok: true,
      url: finalUrl,
      name,
      title,
      description,
      themeColor,
      ogImage: ogImage ? abs(finalUrl, ogImage) : null,
      twitterImage: twitterImage ? abs(finalUrl, twitterImage) : null,
      icons,
      appleIcons,
      manifest: manifest ? {
        name: manifest.name, short_name: manifest.short_name,
        theme_color: manifest.theme_color, background_color: manifest.background_color,
        display: manifest.display, start_url: manifest.start_url,
      } : null,
      topCssColors,
      cssVariables,
      fonts: [...fonts],
      stylesheetsScanned: styleSheets.length,
      ai: ai ?? null,
    });
  } catch (e) {
    return jsonRes({ error: (e as Error).message }, 500);
  }
});
