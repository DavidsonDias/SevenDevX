/**
 * 🏦 ClientsFinanceAdmin — dashboard financeiro por cliente.
 * Receita, margem, pendente, histórico. Visão enterprise por conta.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, Wallet, TrendingUp, Clock, Search } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/money";

interface ClientRow {
  client_id: string | null;
  client_name: string;
  projects_count: number;
  income_brl: number;
  expense_brl: number;
  pending_brl: number;
  paid_brl: number;
  net_margin_brl: number;
  margin_percent: number;
  last_tx_at: string | null;
}

export default function ClientsFinanceAdmin() {
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["client_finance_summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fn_client_finance_summary");
      if (error) throw error;
      return (data || []) as ClientRow[];
    },
  });

  const filtered = useMemo(
    () => data.filter((r) => !q || r.client_name.toLowerCase().includes(q.toLowerCase())),
    [data, q]
  );

  const totals = useMemo(() => {
    return data.reduce(
      (acc, r) => ({
        income: acc.income + Number(r.income_brl || 0),
        expense: acc.expense + Number(r.expense_brl || 0),
        pending: acc.pending + Number(r.pending_brl || 0),
        margin: acc.margin + Number(r.net_margin_brl || 0),
      }),
      { income: 0, expense: 0, pending: 0, margin: 0 }
    );
  }, [data]);

  const chartData = filtered.slice(0, 10).map((r) => ({
    name: r.client_name.length > 14 ? r.client_name.slice(0, 12) + "…" : r.client_name,
    receita: Number(r.income_brl || 0),
    margem: Number(r.net_margin_brl || 0),
  }));

  return (
    <AdminPageShell
      title="Financeiro por Cliente"
      subtitle="Receita acumulada, margem e contas a receber agrupado por cliente"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={Users} label="Clientes ativos" value={data.length.toString()} />
        <Kpi icon={Wallet} label="Receita total" value={formatMoney(totals.income)} accent="text-emerald-400" />
        <Kpi icon={Clock} label="Em aberto" value={formatMoney(totals.pending)} accent="text-amber-400" />
        <Kpi icon={TrendingUp} label="Margem líquida" value={formatMoney(totals.margin)} accent="text-blue-400" />
      </div>

      {chartData.length > 0 && (
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Top 10 clientes · receita vs margem</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 8 }} formatter={(v: any) => formatMoney(Number(v))} />
                <Bar dataKey="receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="margem" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.margem >= 0 ? "#3b82f6" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente…"
          className="pl-9 bg-white/5 border-white/10"
        />
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.15em] text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-right p-3">Projetos</th>
                  <th className="text-right p-3">Receita</th>
                  <th className="text-right p-3">Pendente</th>
                  <th className="text-right p-3">Margem</th>
                  <th className="text-right p-3">%</th>
                  <th className="text-right p-3 hidden md:table-cell">Última tx</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={7} className="p-8 text-center text-white/50">Carregando…</td></tr>
                )}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-white/50">Nenhum cliente encontrado.</td></tr>
                )}
                {filtered.map((r, i) => (
                  <motion.tr
                    key={(r.client_id || "none") + i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="p-3 font-medium">{r.client_name}</td>
                    <td className="p-3 text-right text-white/70">{r.projects_count}</td>
                    <td className="p-3 text-right text-emerald-400">{formatMoney(Number(r.income_brl))}</td>
                    <td className="p-3 text-right text-amber-400">{formatMoney(Number(r.pending_brl))}</td>
                    <td className={`p-3 text-right ${Number(r.net_margin_brl) >= 0 ? "text-blue-400" : "text-rose-400"}`}>
                      {formatMoney(Number(r.net_margin_brl))}
                    </td>
                    <td className="p-3 text-right">
                      <Badge variant="outline" className={Number(r.margin_percent) >= 30 ? "border-emerald-400/40 text-emerald-300" : "border-white/10 text-white/60"}>
                        {Number(r.margin_percent).toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-white/50 text-xs hidden md:table-cell">
                      {r.last_tx_at ? new Date(r.last_tx_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

const Kpi = ({ icon: Icon, label, value, accent = "text-white" }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</span>
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
        <div className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);
