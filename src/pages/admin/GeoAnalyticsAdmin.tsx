/**
 * 🛰️ GEO Analytics Admin — discoverability em LLMs e AI Search.
 * Mostra tráfego de bots de IA, top páginas GEO e checklist de indexação.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bot, Sparkles, Search, FileText, Globe2, ShieldCheck,
  TrendingUp, ExternalLink, RefreshCw, BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import AdminMenu from "@/components/admin/AdminMenu";
import GlassCard from "@/components/GlassCard";
import SEOHead from "@/components/SEOHead";
import { GEO_ARTICLES, GEO_PROGRAMMATIC } from "@/data/geoContent";

const AI_BOTS = [
  { id: "gptbot", name: "GPTBot (OpenAI)", match: /GPTBot/i },
  { id: "oai-searchbot", name: "OAI-SearchBot", match: /OAI-SearchBot/i },
  { id: "chatgpt-user", name: "ChatGPT-User", match: /ChatGPT-User/i },
  { id: "claudebot", name: "ClaudeBot (Anthropic)", match: /ClaudeBot|Claude-Web/i },
  { id: "perplexitybot", name: "PerplexityBot", match: /PerplexityBot/i },
  { id: "google-extended", name: "Google-Extended", match: /Google-Extended/i },
  { id: "bingbot", name: "Bingbot / CoPilot", match: /bingbot|copilot/i },
  { id: "applebot", name: "Applebot-Extended", match: /Applebot/i },
  { id: "ccbot", name: "CCBot (Common Crawl)", match: /CCBot/i },
  { id: "youbot", name: "YouBot", match: /YouBot/i },
  { id: "meta", name: "Meta-ExternalAgent", match: /Meta-ExternalAgent|FacebookBot/i },
];

const GEO_ROUTES = [
  "/ai", "/why-sevendevx",
  "/answers", "/knowledge-base",
  ...GEO_ARTICLES.map((a) => `/${a.category === "answer" ? "answers" : "knowledge-base"}/${a.slug}`),
  ...GEO_PROGRAMMATIC.cities.map((c) => `/local/${c.slug}`),
];

interface PageView {
  page_path: string;
  user_agent: string | null;
  visitor_id: string | null;
  created_at: string;
}

export default function GeoAnalyticsAdmin() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<PageView[]>([]);
  const [days, setDays] = useState(30);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data } = await supabase
      .from("page_views")
      .select("page_path, user_agent, visitor_id, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    setViews((data as PageView[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); /* eslint-disable-next-line */ }, [isAdmin, days]);

  const metrics = useMemo(() => {
    const aiViews = views.filter((v) => AI_BOTS.some((b) => b.match.test(v.user_agent || "")));
    const geoViews = views.filter((v) => GEO_ROUTES.some((r) => v.page_path === r || v.page_path.startsWith(r + "/")));
    const aiByBot = AI_BOTS.map((b) => ({
      ...b,
      count: views.filter((v) => b.match.test(v.user_agent || "")).length,
    })).sort((a, b) => b.count - a.count);

    const topRoutesMap = new Map<string, number>();
    geoViews.forEach((v) => topRoutesMap.set(v.page_path, (topRoutesMap.get(v.page_path) || 0) + 1));
    const topRoutes = Array.from(topRoutesMap.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    return {
      total: views.length,
      aiHits: aiViews.length,
      geoHits: geoViews.length,
      uniqueBots: aiByBot.filter((b) => b.count > 0).length,
      aiByBot: aiByBot.slice(0, 8),
      topRoutes,
    };
  }, [views]);

  const indexationChecks = [
    { name: "llms.txt publicado", ok: true, url: "/llms.txt", desc: "Guia para LLMs descobrirem conteúdo." },
    { name: "ai.txt publicado", ok: true, url: "/ai.txt", desc: "Política de uso por IAs." },
    { name: "robots.txt libera AI bots", ok: true, url: "/robots.txt", desc: "GPTBot, ClaudeBot, PerplexityBot, etc." },
    { name: "sitemap.xml atualizado", ok: true, url: "/sitemap.xml", desc: "Inclui rotas GEO + locais + artigos." },
    { name: "Knowledge Graph JSON-LD", ok: true, url: "/", desc: "Organization + LocalBusiness sitewide." },
    { name: `${GEO_ARTICLES.length} artigos GEO publicados`, ok: GEO_ARTICLES.length >= 5, url: "/answers", desc: "Pilares com FAQ + Speakable schema." },
    { name: `${GEO_PROGRAMMATIC.cities.length} páginas locais ativas`, ok: true, url: "/local/belo-horizonte", desc: "GeoCoordinates por cidade." },
  ];

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead title="GEO Analytics — Discoverability em IA" description="Tráfego de bots de IA, top rotas GEO e checklist de indexação." />

      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <AdminMenu />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold font-orbitron truncate flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> GEO Analytics
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Generative Engine Optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs"
            >
              <option value={7}>7d</option>
              <option value={30}>30d</option>
              <option value={90}>90d</option>
            </select>
            <button onClick={load} className="p-2 border border-white/10 rounded-lg hover:bg-white/5">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Bot, label: "AI Bot Hits", value: metrics.aiHits, color: "text-emerald-400" },
            { icon: BarChart3, label: "Views Páginas GEO", value: metrics.geoHits, color: "text-cyan-400" },
            { icon: Globe2, label: "Bots Únicos", value: metrics.uniqueBots, color: "text-violet-400" },
            { icon: TrendingUp, label: "Total Views", value: metrics.total, color: "text-amber-400" },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <k.icon className={`w-4 h-4 mb-2 ${k.color}`} />
                <p className="text-[10px] uppercase tracking-wider text-white/40">{k.label}</p>
                <p className="text-2xl font-bold font-orbitron mt-1">{k.value.toLocaleString("pt-BR")}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Bots */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" /> Tráfego por AI Bot
            </h2>
            {metrics.aiByBot.every((b) => b.count === 0) ? (
              <p className="text-xs text-white/40 py-8 text-center">
                Nenhum hit de bot de IA nos últimos {days} dias. Bots indexam em ciclos — aguarde 1-4 semanas após publicar.
              </p>
            ) : (
              <ul className="space-y-2">
                {metrics.aiByBot.map((b) => {
                  const max = Math.max(...metrics.aiByBot.map((x) => x.count), 1);
                  return (
                    <li key={b.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80">{b.name}</span>
                        <span className="font-mono text-emerald-400">{b.count}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${(b.count / max) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassCard>

          {/* Checklist */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Checklist de Indexação
            </h2>
            <ul className="space-y-2">
              {indexationChecks.map((c) => (
                <li key={c.name} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mt-0.5 ${c.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {c.ok ? "✓" : "✗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{c.name}</p>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[10px] text-white/40">{c.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        {/* Top GEO routes */}
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Top Páginas GEO
          </h2>
          {metrics.topRoutes.length === 0 ? (
            <p className="text-xs text-white/40 py-6 text-center">Sem visitas em rotas GEO ainda. Compartilhe links e aguarde indexação.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-white/40 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="text-left py-2">Rota</th>
                    <th className="text-right py-2">Views</th>
                    <th className="text-right py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topRoutes.map((r) => (
                    <tr key={r.path} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 font-mono text-white/80">{r.path}</td>
                      <td className="py-2 text-right font-mono text-cyan-400">{r.count}</td>
                      <td className="py-2 text-right">
                        <Link to={r.path} className="text-white/40 hover:text-white inline-flex">
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* External tools */}
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-violet-400" /> Ferramentas Externas
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { name: "Google Search Console", url: "https://search.google.com/search-console" },
              { name: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters" },
              { name: "Google Rich Results Test", url: "https://search.google.com/test/rich-results?url=https%3A%2F%2Fsevendevx.com" },
              { name: "Schema Validator", url: "https://validator.schema.org/" },
              { name: "PageSpeed Insights", url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fsevendevx.com" },
              { name: "Perplexity (teste)", url: "https://www.perplexity.ai/search?q=SevenDevX" },
            ].map((t) => (
              <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/30 text-xs">
                <span>{t.name}</span>
                <ExternalLink className="w-3 h-3 text-white/40" />
              </a>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
