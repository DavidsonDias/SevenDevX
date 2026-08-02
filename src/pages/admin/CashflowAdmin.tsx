/**
 * 🚀 CashflowAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/pages/admin/CashflowAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/cashflow
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Projeção de caixa a partir das transações previstas.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `CashflowAdmin`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Invoca RPC: `fn_cashflow_forecast`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🧩 ARQUITETURA DO ARQUIVO                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * CashflowAdmin
 *    ├── AdminPageShell
 *    ├── Card
 *    └── CardContent
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Hooks: useQuery
 *    ↓
 * CashflowAdmin.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ React Query — consulta, cache e invalidação
 * ✅ Framer Motion — transições e animações
 * ✅ Recharts — visualização de dados
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/pages/admin/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/AUTHORIZATION.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 💸 CashflowAdmin — Fluxo de caixa previsto 90 dias.
 */
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/money";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function CashflowAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["cashflow_forecast"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fn_cashflow_forecast", { _days: 90 });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        date: new Date(r.day_label).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        income: Number(r.projected_income),
        expense: -Number(r.projected_expense),
        balance: Number(r.running_balance),
      }));
    },
  });

  const last = data?.[data.length - 1];
  const totalIn = (data || []).reduce((s, d) => s + d.income, 0);
  const totalOut = (data || []).reduce((s, d) => s + d.expense, 0);

  return (
    <AdminPageShell title="Fluxo de Caixa" subtitle="Projeção dos próximos 90 dias baseada em transações pending/scheduled">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Saldo final 90d</span><Wallet className="w-4 h-4 text-blue-400" /></div>
          <div className="text-2xl font-bold">{formatMoney(last?.balance || 0)}</div>
        </CardContent></Card>
        <Card className="bg-white/5 border-white/10"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Entradas previstas</span><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
          <div className="text-2xl font-bold text-emerald-400">{formatMoney(totalIn)}</div>
        </CardContent></Card>
        <Card className="bg-white/5 border-white/10"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Saídas previstas</span><TrendingDown className="w-4 h-4 text-rose-400" /></div>
          <div className="text-2xl font-bold text-rose-400">{formatMoney(-totalOut)}</div>
        </CardContent></Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            {isLoading ? <div className="h-80 grid place-items-center text-white/50">Carregando…</div> : (
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 8 }} formatter={(v: any) => formatMoney(Number(v))} />
                  <Legend />
                  <Area type="monotone" dataKey="balance" name="Saldo acumulado" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="income" name="Entradas" stroke="#22c55e" fill="url(#g2)" />
                  <Area type="monotone" dataKey="expense" name="Saídas" stroke="#ef4444" fill="url(#g3)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AdminPageShell>
  );
}
