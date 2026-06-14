/**
 * 📊 SearchConsoleAdmin — visualiza dados do Google Search Console
 * via edge function gsc-insights (Lovable Connector Gateway).
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, MousePointerClick, Eye, Loader2, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";

type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type Dim = "query" | "page" | "country" | "device";

export default function SearchConsoleAdmin() {
  const [site, setSite] = useState("https://www.sevendevx.com/");
  const [days, setDays] = useState(28);
  const [dim, setDim] = useState<Dim>("query");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<string[]>([]);

  async function loadSites() {
    const { data, error } = await supabase.functions.invoke("gsc-insights", { body: { action: "sites" } });
    if (error) return setError(error.message);
    const entries = (data?.siteEntry ?? []).map((s: any) => s.siteUrl);
    setSites(entries);
  }

  async function load() {
    setLoading(true); setError(null);
    const { data, error } = await supabase.functions.invoke("gsc-insights", {
      body: { action: "analytics", site, days, dimension: dim },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data?.error) return setError(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
    setRows(data?.rows ?? []);
  }

  useEffect(() => { loadSites(); }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [site, days, dim]);

  const totals = rows.reduce(
    (acc, r) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions }),
    { clicks: 0, impressions: 0 },
  );
  const avgCtr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgPos = rows.length ? rows.reduce((s, r) => s + r.position, 0) / rows.length : 0;

  return (
    <AdminPageShell title="Search Console" description="Performance orgânica no Google — queries, páginas, países e devices.">
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <select value={site} onChange={(e) => setSite(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-card text-sm">
          {sites.length === 0 && <option value={site}>{site}</option>}
          {sites.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-border bg-card text-sm">
          <option value={7}>Últimos 7 dias</option>
          <option value={28}>Últimos 28 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {(["query","page","country","device"] as Dim[]).map((d) => (
            <button key={d} onClick={() => setDim(d)}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider ${dim===d?"bg-foreground text-background":"text-muted-foreground"}`}>
              {d}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
        </Button>
      </div>

      {error && <div className="p-4 mb-6 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi icon={MousePointerClick} label="Cliques" value={totals.clicks.toLocaleString()} />
        <Kpi icon={Eye} label="Impressões" value={totals.impressions.toLocaleString()} />
        <Kpi icon={TrendingUp} label="CTR médio" value={`${avgCtr.toFixed(2)}%`} />
        <Kpi icon={Search} label="Posição média" value={avgPos.toFixed(1)} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">{dim}</th>
              <th className="p-3 text-right">Cliques</th>
              <th className="p-3 text-right">Impressões</th>
              <th className="p-3 text-right">CTR</th>
              <th className="p-3 text-right">Posição</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                className="border-t border-border/50 hover:bg-muted/30">
                <td className="p-3 font-medium truncate max-w-md">{r.keys.join(" · ")}</td>
                <td className="p-3 text-right">{r.clicks}</td>
                <td className="p-3 text-right">{r.impressions}</td>
                <td className="p-3 text-right">{(r.ctr * 100).toFixed(2)}%</td>
                <td className="p-3 text-right">{r.position.toFixed(1)}</td>
              </motion.tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground text-sm">
                Sem dados ainda. Verifique se o site está verificado no Search Console e tem tráfego no período.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
