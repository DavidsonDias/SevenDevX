/**
 * 📈 ForecastAdmin — receita ponderada por mês baseada em probabilidade × forecast_value.
 */
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, DollarSign, Target } from "lucide-react";

export default function ForecastAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("fn_pipeline_forecast_v2" as any);
      setRows((data as any[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const total = rows.reduce((s, r) => s + Number(r.weighted_revenue || 0), 0);
  const raw = rows.reduce((s, r) => s + Number(r.raw_revenue || 0), 0);
  const count = rows.reduce((s, r) => s + (r.project_count || 0), 0);

  const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

  return (
    <AdminPageShell title="Forecast de Receita" subtitle="Pipeline ponderado por probabilidade × valor previsto">
      {loading ? <div className="py-20 text-center text-white/40">Carregando...</div> : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat icon={<TrendingUp className="w-4 h-4" />} label="Receita ponderada" value={fmt(total)} accent="text-emerald-300" />
            <Stat icon={<DollarSign className="w-4 h-4" />} label="Pipeline bruto" value={fmt(raw)} accent="text-sky-300" />
            <Stat icon={<Target className="w-4 h-4" />} label="Projetos ativos" value={String(count)} accent="text-amber-300" />
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="text-xs uppercase tracking-wider text-white/50 mb-4">Receita ponderada por mês</div>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={rows}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month_label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => fmt(Number(v)).replace("R$","")} />
                  <Tooltip contentStyle={{ background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    formatter={(v: any) => fmt(Number(v))} />
                  <Bar dataKey="weighted_revenue" fill="rgb(52,211,153)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {rows.length === 0 && (
            <div className="text-center text-white/40 text-sm py-10">
              Adicione <code className="text-white/70">probability</code> e <code className="text-white/70">forecast_value</code> nos projetos para popular o forecast.
            </div>
          )}
        </div>
      )}
    </AdminPageShell>
  );
}

function Stat({ icon, label, value, accent }: any) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${accent}`}>{icon}{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
