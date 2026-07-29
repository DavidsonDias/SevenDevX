/**
 * GeoAnalyticsAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/GeoAnalyticsAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/geo
 *
 * @description
 * Tráfego e citações originadas de IA.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

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
import AdminPageShell from "@/components/admin/AdminPageShell";
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
    { name: "llm-context.json publicado", ok: true, url: "/llm-context.json", desc: "Dataset estruturado para RAG e citação." },
    { name: "robots.txt libera AI bots", ok: true, url: "/robots.txt", desc: "GPTBot, ClaudeBot, PerplexityBot, etc." },
    { name: "sitemap.xml atualizado", ok: true, url: "/sitemap.xml", desc: "Inclui rotas GEO + locais + artigos." },
    { name: "Knowledge Graph JSON-LD", ok: true, url: "/", desc: "Organization + LocalBusiness sitewide." },
    { name: "Entity Graph @graph", ok: true, url: "/", desc: "20+ entidades com relacionamentos." },
    { name: `${GEO_ARTICLES.length} artigos GEO publicados`, ok: GEO_ARTICLES.length >= 5, url: "/answers", desc: "Pilares com FAQ + Speakable schema." },
    { name: `${GEO_PROGRAMMATIC.cities.length} páginas locais ativas`, ok: true, url: "/local/belo-horizonte", desc: "GeoCoordinates por cidade." },
  ];

  // 🎯 GEO Health Score (0-100)
  const healthScore = useMemo(() => {
    const indexationPts = (indexationChecks.filter((c) => c.ok).length / indexationChecks.length) * 50;
    const contentPts = Math.min(GEO_ARTICLES.length / 20, 1) * 25;
    const aiTrafficPts = metrics.aiHits > 0 ? Math.min(metrics.aiHits / 100, 1) * 15 : 0;
    const botDiversityPts = Math.min(metrics.uniqueBots / 6, 1) * 10;
    return Math.round(indexationPts + contentPts + aiTrafficPts + botDiversityPts);
  }, [indexationChecks, metrics]);

  const scoreColor = healthScore >= 85 ? "text-emerald-400" : healthScore >= 65 ? "text-amber-400" : "text-rose-400";
  const scoreLabel = healthScore >= 85 ? "Enterprise-grade" : healthScore >= 65 ? "Sólido" : "Precisa melhorar";

  if (!isAdmin) return null;

  return (
    <>
      <SEOHead title="GEO Analytics — Discoverability em IA" description="Tráfego de bots de IA, top rotas GEO e checklist de indexação." />
      <AdminPageShell
        title="GEO Analytics"
        subtitle="Generative Engine Optimization"
        actions={
          <>
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
          </>
        }
      >
        <div className="space-y-6">
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

        {/* 🎯 GEO Health Score Hero */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" fill="none" className="text-white/5" />
                    <circle
                      cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" fill="none"
                      strokeLinecap="round" strokeDasharray={`${(healthScore / 100) * 264} 264`}
                      className={scoreColor}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold font-orbitron ${scoreColor}`}>{healthScore}</span>
                    <span className="text-[8px] uppercase tracking-wider text-white/40">score</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">GEO Health Score</p>
                  <h2 className={`text-xl font-bold font-orbitron ${scoreColor}`}>{scoreLabel}</h2>
                  <p className="text-xs text-white/60 mt-1 max-w-md">
                    Score composto por indexação técnica (50pts), volume de conteúdo (25pts), tráfego de bots de IA (15pts) e diversidade de bots (10pts).
                  </p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 md:border-l md:border-white/10 md:pl-6">
                {[
                  { label: "Indexação", value: `${indexationChecks.filter((c) => c.ok).length}/${indexationChecks.length}`, color: "text-emerald-400" },
                  { label: "Artigos GEO", value: GEO_ARTICLES.length, color: "text-cyan-400" },
                  { label: "AI Hits", value: metrics.aiHits, color: "text-violet-400" },
                  { label: "Bots únicos", value: metrics.uniqueBots, color: "text-amber-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-white/40">{s.label}</p>
                    <p className={`text-lg font-bold font-mono mt-0.5 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

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
        </div>
      </AdminPageShell>
    </>
  );
}
